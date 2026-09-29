# A three-radiator capsule speaker in the Lifestyle Ultra idiom, proportioned to
# Bose's published photographs and marketing cutaway and to the published
# envelope 184.7 (H) x 121.1 (W) x 167.5 (D) mm.  Footprint is an egg: a broad
# rounded front, a narrower semicircular rear (top photograph).  The up-firing
# grille (69 mm) sits 41 mm behind the front edge, the control disc (49 mm)
# 41 mm ahead of the rear edge; the rear port (63 x 21 mm) is 56 mm above the
# table.  Interior: forward tweeter directly above a forward woofer on the midline, an up-firing driver
# under the grille, and a duct that rises up the rear wall from the port and
# hooks over at the top (cutaway).  Front is -Y, up is +Z.  Original geometry.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from speaker_common import *

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bose.glb')
reset_scene(); make_root('bose'); M = palette(); P = Parts()

H, W, D = 184.7, 121.1, 167.5
Y_FRONT, Y_REAR = -0.5 * D, 0.5 * D
Z_PLINTH, Z_TOP = 19.0, H - 5.0

def outline(a, s=1.0):
    """Egg footprint: a superellipse with a flatter, broader front (y<0) and a rounder, narrower rear."""
    c, si = math.cos(a), math.sin(a)
    if si < 0:   # front half
        p, wscale, dy = 3.2, 1.0, -Y_FRONT
    else:        # rear half
        p, wscale, dy = 2.1, 0.93, Y_REAR
    x = (W / 2) * wscale * math.copysign(abs(c) ** (2 / p), c)
    y = dy * math.copysign(abs(si) ** (2 / p), si)
    return x * s, y * s

def bulge(z):
    """The body is very slightly barrelled and tucks in under the top cap."""
    t = (z - 100) / 90.0
    return 0.975 + 0.025 * math.sqrt(max(0.0, 1 - t * t)) ** 0.8

def ring_at(z, s, na=96):
    return [(*outline(TAU * k / na, s), z) for k in range(na)]

def loft_open(b, rings, mi=0, flip=False):
    n = len(rings[0]); m = len(rings)
    verts = [v for ring in rings for v in ring]; faces = []
    for i in range(m - 1):
        for k in range(n - 1):
            q = [i * n + k, i * n + k + 1, (i + 1) * n + k + 1, (i + 1) * n + k]
            faces.append(q[::-1] if flip else q)
    b.add(verts, faces, mi, True)

def half_shell(a0, a1, z0, z1, thick=2.2, nz=26, na=48):
    ro, ri = [], []
    for i in range(nz + 1):
        z = z0 + (z1 - z0) * i / nz; s = bulge(z)
        ro.append([(*outline(a0 + (a1 - a0) * k / na, s), z) for k in range(na + 1)])
        ri.append([(*outline(a0 + (a1 - a0) * k / na, s - thick / (W / 2)), z) for k in range(na + 1)])
    b = Builder(); loft_open(b, ro, mi=0); loft_open(b, ri, mi=0, flip=True); return b

# ---------------------------------------------------------------- shell halves, plinth, top cap
b = half_shell(math.pi, 2 * math.pi, Z_PLINTH, Z_TOP)
P.add(b, 'shell_front', [M['fabric_d']], 'shell', (0, -80, 0), layer='shell', label='fabric shell (front half)')
b = half_shell(0.0, math.pi, Z_PLINTH, Z_TOP)
P.add(b, 'shell_back', [M['fabric_d']], 'shell', (0, 80, 0), layer='shell', label='fabric shell (back half)')
b = Builder(); loft(b, [ring_at(0, 0.90), ring_at(3, 0.925), ring_at(Z_PLINTH - 1, bulge(Z_PLINTH) - 0.01), ring_at(Z_PLINTH + 1, bulge(Z_PLINTH) - 0.04)], mi=0)
P.add(b, 'plinth', [M['shell_d']], 'base', (0, 0, -50), layer='shell', label='plinth')
b = Builder(); loft(b, [ring_at(Z_TOP - 1, bulge(Z_TOP) - 0.04), ring_at(Z_TOP + 0.5, bulge(Z_TOP) + 0.01), ring_at(H - 1.5, 0.985), ring_at(H, 0.955)], mi=0)
P.add(b, 'top_cap', [M['shell_d']], 'top', (0, 0, 60), layer='shell', label='top cap')
Y_GRILLE, R_GRILLE = Y_FRONT + 41.0, 34.5
b = Builder(); cyl(b, 0, Y_GRILLE, R_GRILLE + 1.5, H - 0.8, H + 0.3, 72, rin=R_GRILLE - 1.0, mi=0); cyl(b, 0, Y_GRILLE, R_GRILLE - 1.0, H - 0.8, H - 0.3, 72, mi=1)
P.add(b, 'top_grille', [M['plastic_l'], M['plastic']], 'top', (0, 0, 60), layer='shell', label='up-firing grille')
Y_CTRL = Y_REAR - 41.0
b = Builder(); cyl(b, 0, Y_CTRL, 24.5, H - 1.2, H + 0.1, 64, rin=23.0, mi=0)
P.add(b, 'top_controls', [M['plastic_l']], 'top', (0, 0, 60), layer='shell', label='control disc')
# rear port frame: 63 x 21 mm opening centred 56 mm above the table
PW, PH, PZ = 63.0, 21.0, 56.0
b = Builder()
yr = Y_REAR * 0.93 - 1.0
for (x0, x1, z0, z1) in ((-PW / 2 - 4, PW / 2 + 4, PZ + PH / 2, PZ + PH / 2 + 4), (-PW / 2 - 4, PW / 2 + 4, PZ - PH / 2 - 4, PZ - PH / 2),
                         (-PW / 2 - 4, -PW / 2, PZ - PH / 2, PZ + PH / 2), (PW / 2, PW / 2 + 4, PZ - PH / 2, PZ + PH / 2), (-1.2, 1.2, PZ - PH / 2, PZ + PH / 2)):
    box(b, x0, x1, yr - 3, yr + 3, z0, z1, mi=0)
P.add(b, 'port_frame', [M['plastic']], 'duct', (0, 60, 0), layer='shell', label='rear port opening')

# ---------------------------------------------------------------- chassis frame behind the front fabric (rails, not a plate, so the drivers read)
Y_BAF = Y_FRONT + 9.0
b = Builder()
for x0, x1 in ((-48, -42), (42, 48)):
    box(b, x0, x1, Y_BAF - 1.5, Y_BAF + 6, Z_PLINTH + 3, Z_TOP - 6, mi=0)
box(b, -48, 48, Y_BAF - 1.5, Y_BAF + 6, Z_PLINTH + 3, Z_PLINTH + 9, mi=0)
box(b, -48, 48, Y_BAF - 1.5, Y_BAF + 6, Z_TOP - 12, Z_TOP - 6, mi=0)
box(b, -48, 48, Y_BAF - 1.5, Y_BAF + 6, 112, 118, mi=0)
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
