# A three-radiator speaker in the Lifestyle Ultra idiom, proportioned to
# Bose's published photographs and marketing cutaway and to the published
# envelope 184.7 (H) x 121.1 (W) x 167.5 (D) mm.  Footprint is a stadium (top
# photograph).  A fabric panel wraps the front and the front half of the sides
# with rounded corners; the rest is hard shell, on a rounded base tub and a
# narrower foot.  The up-firing grille (69 mm) is centred 57 mm behind the
# front edge, the control disc (49 mm) 36 mm ahead of the rear edge; the rear
# port (63 x 21 mm) is 56 mm above the table.  Interior: forward tweeter directly above a forward woofer on the midline, an up-firing driver
# under the grille, and a duct that rises up the rear wall from the port and
# hooks over at the top (cutaway).  Front is -Y, up is +Z.  Original geometry.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from speaker_common import *

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bose.glb')
reset_scene(); make_root('bose'); M = palette(); P = Parts()
M['grille'] = mat('grille', (0.028, 0.028, 0.03), 0.0, 0.95)
M['ctrl'] = mat('control_disc', (0.03, 0.03, 0.032), 0.0, 0.75)
M['groove'] = mat('groove', (0.03, 0.03, 0.03), 0.0, 0.9)
for _k in ('grille', 'ctrl', 'groove'): M[_k].use_backface_culling = False   # the disc caps face down in cyl(); render both sides

H, W, D = 184.7, 121.1, 167.5
Y_FRONT, Y_REAR = -0.5 * D, 0.5 * D

# ---------------------------------------------------------------- footprint: a stadium (top photograph: two
# semicircular ends joined by short straight sides), perimeter parameterised by arc length u from the front centre
R_END = W / 2
H_STR = (D - W) / 2                  # half-length of the straight sides
L_ARC = math.pi * R_END / 2          # front centre to the side, along the front arc
PERIM = 2 * math.pi * R_END + 4 * H_STR
def perim(u, off=0.0):
    """Point and outward normal on the stadium outline offset by `off` mm, u = arc length from the front centre, anticlockwise from +x."""
    u %= PERIM
    segs = [L_ARC, 2 * H_STR, 2 * L_ARC, 2 * H_STR, L_ARC]
    k = 0
    while k < 4 and u > segs[k]: u -= segs[k]; k += 1
    if k == 0:   th = u / R_END;               nx, ny = math.sin(th), -math.cos(th); cx, cy = 0, -H_STR
    elif k == 1: nx, ny = 1.0, 0.0;            cx, cy = 0, -H_STR + u
    elif k == 2: th = u / R_END;               nx, ny = math.cos(th), math.sin(th); cx, cy = 0, H_STR
    elif k == 3: nx, ny = -1.0, 0.0;           cx, cy = 0, H_STR - u
    else:        th = u / R_END;               nx, ny = -math.cos(th), -math.sin(th); cx, cy = 0, -H_STR
    if k in (1, 3): px, py = (R_END if k == 1 else -R_END), cy
    else: px, py = cx + R_END * nx, cy + R_END * ny
    return px + nx * off, py + ny * off, nx, ny

def ring(z, off, n=128):
    return [(*perim(PERIM * k / n, off)[:2], z) for k in range(n)]

def strip_shell(u0, u1, z_lo, z_hi, off_out, off_in, nu=80, nz=24, name=None):
    """A band of wall between arc positions u0..u1 and heights z_lo(t)..z_hi(t) (t = 0..1 along u), with thickness."""
    b = Builder(); outer, inner = [], []
    for i in range(nu + 1):
        t = i / nu; u = u0 + (u1 - u0) * t; zl, zh = z_lo(t), z_hi(t)
        po = perim(u, off_out); pi_ = perim(u, off_in)
        outer.append([(po[0], po[1], zl + (zh - zl) * k / nz) for k in range(nz + 1)])
        inner.append([(pi_[0], pi_[1], zl + (zh - zl) * k / nz) for k in range(nz + 1)])
    V = []; F = []
    def idx(side, i, k): return side * (nu + 1) * (nz + 1) + i * (nz + 1) + k
    for side in (outer, inner):
        for col in side: V += col
    for i in range(nu):
        for k in range(nz):
            F.append([idx(0, i, k), idx(0, i + 1, k), idx(0, i + 1, k + 1), idx(0, i, k + 1)])
            F.append([idx(1, i, k), idx(1, i, k + 1), idx(1, i + 1, k + 1), idx(1, i + 1, k)])
    for i in range(nu):   # bottom and top edges
        F.append([idx(0, i, 0), idx(1, i, 0), idx(1, i + 1, 0), idx(0, i + 1, 0)])
        F.append([idx(0, i, nz), idx(0, i + 1, nz), idx(1, i + 1, nz), idx(1, i, nz)])
    for i in (0, nu):     # the two side edges
        for k in range(nz):
            q = [idx(0, i, k), idx(0, i, k + 1), idx(1, i, k + 1), idx(1, i, k)]
            F.append(q if i == 0 else q[::-1])
    b.add(V, F, 0, True)
    return b

# ---------------------------------------------------------------- body.  Front photograph: a 6 mm top cap, the
# fabric panel from under the cap down to 18 mm above the table, then a rounded base tub on a narrower foot.
# Top and rear photographs: the fabric wraps the front and runs back along the sides to just past the widest
# point, ending in rounded corners; everything else is hard shell.
Z_PLINTH, Z_TOP = 18.0, H - 6.0
U_FAB = L_ARC + H_STR + 4.0          # fabric reaches 4 mm past the side mid-point
RC = 12.0                            # corner radius of the fabric panel
def corner(t, lo):
    d = min(t, 1 - t) * 2 * U_FAB    # arc distance from the nearer side edge
    if d >= RC: return 0.0
    return RC - math.sqrt(max(0.0, RC * RC - (RC - d) ** 2))
b = strip_shell(-U_FAB, U_FAB, lambda t: Z_PLINTH + 0.5 + corner(t, True), lambda t: Z_TOP - 0.3 - corner(t, False), 1.6, 0.0, nu=120)
P.add(b, 'shell_front', [M['fabric_d']], 'shell', (0, -80, 0), layer='shell', label='fabric panel (front and sides)')
b = strip_shell(U_FAB - 18.0, PERIM - U_FAB + 18.0, lambda t: Z_PLINTH, lambda t: Z_TOP, 0.0, -2.2, nu=120)
P.add(b, 'shell_back', [M['shell_d']], 'shell', (0, 80, 0), layer='shell', label='hard shell (rear and sides)')

# base tub: rounds in under the body with a ~12 mm fillet onto a foot inset ~19 mm (front photograph)
fil = [ring(18.0 - 12.0 * math.cos(math.pi / 2 * k / 8), -12.0 + 12.0 * math.sin(math.pi / 2 * k / 8)) for k in range(9)]
b = Builder(); loft(b, [ring(0.0, -19.0), ring(4.4, -19.0), ring(5.0, -17.0), ring(5.6, -13.5)] + fil, mi=0, cap0=True, cap1=False)
P.add(b, 'plinth', [M['shell_d']], 'base', (0, 0, -50), layer='shell', label='base and foot')

# top cap: a 6 mm plate with a softened top edge
b = Builder(); loft(b, [ring(Z_TOP - 0.5, -0.2), ring(H - 1.6, 0.0), ring(H - 0.5, -0.7), ring(H, -2.0)], mi=0, cap0=True, cap1=True)
P.add(b, 'top_cap', [M['shell_d']], 'top', (0, 0, 60), layer='shell', label='top cap')
# up-firing grille (69 mm, perforated) and the recessed control disc (49 mm), from the top photograph
Y_GRILLE, R_GRILLE = Y_FRONT + 57.0, 34.5
b = Builder(); cyl(b, 0, Y_GRILLE, R_GRILLE + 1.2, H - 0.4, H + 0.12, 72, rin=R_GRILLE, mi=0); cyl(b, 0, Y_GRILLE, R_GRILLE, H - 0.4, H + 0.06, 72, mi=0)
P.add(b, 'top_grille', [M['grille']], 'top', (0, 0, 60), layer='shell', label='up-firing grille')
Y_CTRL = Y_REAR - 36.0
b = Builder(); cyl(b, 0, Y_CTRL, 24.5, H - 0.4, H + 0.1, 64, rin=23.6, mi=0); cyl(b, 0, Y_CTRL, 23.6, H - 0.4, H + 0.04, 64, mi=0)
P.add(b, 'top_controls', [M['ctrl']], 'top', (0, 0, 60), layer='shell', label='control disc')
# rear port: 63 x 21 mm rounded opening centred 56 mm above the table, split by a centre web (rear photograph)
PW, PH, PZ = 63.0, 21.0, 56.0
yr = Y_REAR - 3.5
b = Builder()
for (x0, x1, z0, z1) in ((-PW / 2 - 3, PW / 2 + 3, PZ + PH / 2, PZ + PH / 2 + 3), (-PW / 2 - 3, PW / 2 + 3, PZ - PH / 2 - 3, PZ - PH / 2),
                         (-PW / 2 - 3, -PW / 2, PZ - PH / 2, PZ + PH / 2), (PW / 2, PW / 2 + 3, PZ - PH / 2, PZ + PH / 2), (-0.8, 0.8, PZ - PH / 2, PZ + PH / 2)):
    box(b, x0, x1, yr - 1, yr + 3.2, z0, z1, mi=0)
P.add(b, 'port_frame', [M['plastic']], 'duct', (0, 60, 0), layer='shell', label='rear port opening')

# ---------------------------------------------------------------- chassis frame behind the front fabric (rails, not a plate, so the drivers read)
Y_BAF = Y_FRONT + 20.0
b = Builder()
for x0, x1 in ((-43, -38), (38, 43)):
    box(b, x0, x1, Y_BAF - 1.5, Y_BAF + 6, Z_PLINTH + 3, Z_TOP - 6, mi=0)
box(b, -43, 43, Y_BAF - 1.5, Y_BAF + 6, Z_PLINTH + 3, Z_PLINTH + 9, mi=0)
box(b, -43, 43, Y_BAF - 1.5, Y_BAF + 6, Z_TOP - 12, Z_TOP - 6, mi=0)
box(b, -43, 43, Y_BAF - 1.5, Y_BAF + 6, 112, 118, mi=0)
box(b, -40, -36, Y_BAF, Y_BAF + 40, Z_PLINTH + 2, Z_PLINTH + 10, mi=0); box(b, 36, 40, Y_BAF, Y_BAF + 40, Z_PLINTH + 2, Z_PLINTH + 10, mi=0)
P.add(b, 'baffle', [M['plastic']], 'chassis', (0, 0, 0), label='chassis frame')

# ---------------------------------------------------------------- forward woofer (axis -Y), ~85 mm frame, centre 72 mm up
rot_fwd = (math.pi / 2, 0, 0)
cone_driver(P, M, 'woofer', 'woofer', 0, 0, z_flange=0, r_cone=36, depth=16, r_vc=13, motor_h=24, magnet_r=31,
            explode_up=1.6, label='woofer', loc=(0, Y_BAF, 72), rot=rot_fwd)

# ---------------------------------------------------------------- forward tweeter in a shallow round waveguide, directly above the woofer
TW = (0, Y_BAF, 143)   # centre line, directly above the woofer (Bose cutaway; front photograph)
dome_tweeter(P, M, 'tweeter', 'tweeter', r_dome=12.0, faceplate_r=20, explode=(0, -55, 0), loc=TW, rot=rot_fwd, label='front tweeter')
b = Builder(); lathe(b, [(14.0, 0), (21.0, -0.2), (27.0, -4.0), (28.0, -5.5), (26.0, -5.5), (20.5, -1.5), (14.0, -1.5)], n=64, mi=0)
P.add(b, 'tweeter_waveguide', [M['horn']], 'tweeter', (0, -55, 0), loc=TW, rot=rot_fwd, label='tweeter waveguide')

# ---------------------------------------------------------------- up-firing driver under the grille, with a flared waveguide
UP = (0, Y_GRILLE + 4.0, 0)
cone_driver(P, M, 'upfire', 'upfire', 0, 0, z_flange=0, r_cone=23, depth=10, r_vc=10, motor_h=20, magnet_r=20,
            explode_up=1.6, label='up-firing driver', loc=(UP[0], UP[1], H - 24), rot=None)
b = Builder(); rings = []
for i in range(7):
    t = i / 6; z = H - 23 + (H - 3 - (H - 23)) * t; rr = 27 + (R_GRILLE - 3 - 27) * t
    rings.append([(UP[0] + rr * math.cos(TAU * k / 64), UP[1] + rr * math.sin(TAU * k / 64), z) for k in range(64)])
loft(b, rings, mi=0, cap0=False, cap1=False)
P.add(b, 'upfire_waveguide', [M['horn']], 'upfire', (0, 0, 40), label='up-firing waveguide')

# ---------------------------------------------------------------- port duct: from the rear opening, up the rear wall, hooking over at the top
yw = yr - 14.0     # duct centreline behind the rear wall
path = [(0, yr + 2, PZ), (0, yr - 8, PZ), (0, yw, PZ + 14), (0, yw, 120), (0, yw + 2, 148), (0, yw - 16, 163), (0, yw - 36, 158), (0, yw - 44, 143), (0, yw - 44, 128)]
b = Builder()
sweep_rect(b, path, PW, PH, mi=0, w_of=lambda t: PW - 8 * math.sin(t * math.pi) ** 2, h_of=lambda t: PH + 3 * t)
P.add(b, 'duct', [M['duct']], 'duct', (0, 70, 0), label='port duct')

# ---------------------------------------------------------------- amplifier board (generic) on the base tray
board(P, M, 'board_amp', 'boards', 0, 8, Z_PLINTH + 3, w=66, d=54, explode=(0, 0, -40), chips=7, seed=5, label='amplifier board')

size = export_glb(OUT, P.meta(kind='bose', width=W, depth=D, height=H,
                              woofer={'p': [0, Y_BAF, 72], 'dir': [0, -1, 0], 'r': 36},
                              tweeter={'p': [TW[0], TW[1], TW[2]], 'dir': [0, -1, 0]},
                              upfire={'p': [UP[0], UP[1], H - 3], 'dir': [0, 0, 1], 'r': R_GRILLE},
                              port={'p': [0, Y_REAR, PZ], 'dir': [0, 1, 0]},
                              provenance='proportioned to Bose product photographs and marketing cutaway; envelope 184.7 x 121.1 x 167.5 mm (headphonecheck); generic construction'))
print('exported', OUT, size, 'bytes,', len(P.list), 'parts')
