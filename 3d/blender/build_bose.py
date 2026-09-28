# Generic three-radiator capsule speaker in the Lifestyle Ultra idiom: forward
# woofer under a forward tweeter, a separate up-firing driver with a flared
# waveguide, a curved rear-exiting port duct.  Original geometry; envelope
# about 184 x 121 x 167 mm.  Front is -Y, up is +Z.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from speaker_common import *

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bose.glb')
reset_scene(); make_root('bose'); M = palette(); P = Parts()

W, D, H = 184.0, 121.0, 167.0
PW = 3.4   # superellipse exponent: racetrack outline

def outline(a, s=1.0):
    """Point on the racetrack outline at parameter angle a, scaled by s."""
    c, si = math.cos(a), math.sin(a)
    x = (W / 2) * math.copysign(abs(c) ** (2 / PW), c)
    y = (D / 2) * math.copysign(abs(si) ** (2 / PW), si)
    return x * s, y * s

def bulge(z):
    """Horizontal scale of the shell with height: slightly barrelled, rounded at the top."""
    t = (z - 80) / 90.0
    return 0.955 + 0.045 * math.sqrt(max(0.0, 1 - t * t)) ** 0.7

def half_shell(a0, a1, z0, z1, thick=2.2, nz=26, na=40):
    rings_o, rings_i = [], []
    for i in range(nz + 1):
        z = z0 + (z1 - z0) * i / nz
        s = bulge(z)
        ro = [(*outline(a0 + (a1 - a0) * k / na, s), z) for k in range(na + 1)]
        ri = [(*outline(a0 + (a1 - a0) * k / na, s - thick / (W / 2)), z) for k in range(na + 1)]
        rings_o.append(ro); rings_i.append(ri)
    b = Builder()
    loft_open(b, rings_o, mi=0); loft_open(b, rings_i, mi=0, flip=True)
    return b

def loft_open(b, rings, mi=0, flip=False):
    n = len(rings[0]); m = len(rings)
    verts = [v for ring in rings for v in ring]
    faces = []
    for i in range(m - 1):
        for k in range(n - 1):
            q = [i * n + k, i * n + k + 1, (i + 1) * n + k + 1, (i + 1) * n + k]
            faces.append(q[::-1] if flip else q)
    b.add(verts, faces, mi, True)

# ---------------------------------------------------------------- shell halves, plinth, top
b = half_shell(math.pi, 2 * math.pi, 10, 157)
P.add(b, 'shell_front', [M['fabric_d']], 'shell', (0, -80, 0), layer='shell', label='fabric shell (front half)')
b = half_shell(0.0, math.pi, 10, 157)
P.add(b, 'shell_back', [M['fabric_d']], 'shell', (0, 80, 0), layer='shell', label='fabric shell (back half)')

def ring_at(z, s, na=80):
    return [(*outline(TAU * k / na, s), z) for k in range(na)]
b = Builder(); loft(b, [ring_at(0, 0.93), ring_at(2.5, 0.955), ring_at(10, bulge(10)), ring_at(12, bulge(12) - 0.03)], mi=0)
P.add(b, 'plinth', [M['shell_d']], 'base', (0, 0, -50), layer='shell', label='plinth')
b = Builder(); loft(b, [ring_at(155, bulge(155) - 0.03), ring_at(157, bulge(157)), ring_at(163, 0.93), ring_at(H, 0.86)], mi=0)
P.add(b, 'top_cap', [M['shell_d']], 'top', (0, 0, 60), layer='shell', label='top cap')
# up-firing grille in the top cap: a ring of small holes is expensive; a recessed disc reads as the grille
b = Builder(); cyl(b, 0, 14, 34, H - 0.6, H + 0.4, 64, rin=31, mi=0)
P.add(b, 'top_grille_ring', [M['plastic_l']], 'top', (0, 0, 60), layer='shell', label='top grille bezel')
# rear port frame
b = Builder()
box(b, -34, 34, 56, 61, 96, 100, mi=0); box(b, -34, 34, 56, 61, 116, 120, mi=0)
box(b, -34, -30, 56, 61, 96, 120, mi=0); box(b, 30, 34, 56, 61, 96, 120, mi=0)
P.add(b, 'port_frame', [M['plastic']], 'duct', (0, 60, 0), layer='shell', label='rear port opening')

# ---------------------------------------------------------------- chassis: a baffle plate behind the front fabric
b = Builder()
# baffle: vertical plate at y = -50, with holes for the woofer and tweeter
pts = rounded([(-72, 14), (72, 14), (72, 150), (-72, 150)], r=14)
verts = [(x, -50.5, z) for x, z in pts] + [(x, -48.0, z) for x, z in pts]
n = len(pts)
faces = [[i, (i + 1) % n, n + (i + 1) % n, n + i] for i in range(n)]
b.add(verts, faces, 0, False)
# baffle holes are implied by the drivers sitting through it; add two support ribs to the floor
box(b, -60, -56, -48, 30, 12, 20, mi=0); box(b, 56, 60, -48, 30, 12, 20, mi=0)
P.add(b, 'baffle', [M['plastic']], 'chassis', (0, 0, 0), label='baffle and ribs')

# ---------------------------------------------------------------- forward woofer (axis -Y)
rot_fwd = (math.pi / 2, 0, 0)     # local +Z -> world -Y
cone_driver(P, M, 'woofer', 'woofer', 0, 0, z_flange=0, r_cone=37, depth=17, r_vc=14, motor_h=26, magnet_r=32,
            explode_up=1.6, label='woofer', loc=(0, -50, 62), rot=rot_fwd)

# ---------------------------------------------------------------- forward tweeter with a shallow waveguide
dome_tweeter(P, M, 'tweeter', 'tweeter', r_dome=12.5, faceplate_r=24, explode=(0, -55, 0), loc=(0, -50, 119), rot=rot_fwd, label='front tweeter')
b = Builder(); lathe(b, [(14.5, 0), (24.0, -0.2), (30.0, -4.5), (31.0, -6.0), (29.0, -6.0), (23.0, -1.5), (14.5, -1.5)], n=64, mi=0)
P.add(b, 'tweeter_waveguide', [M['horn']], 'tweeter', (0, -55, 0), loc=(0, -50, 119), rot=rot_fwd, label='tweeter waveguide')

# ---------------------------------------------------------------- up-firing driver with a flared waveguide
cone_driver(P, M, 'upfire', 'upfire', 0, 0, z_flange=0, r_cone=25, depth=11, r_vc=10.5, motor_h=20, magnet_r=25,
            explode_up=1.6, label='up-firing driver', loc=(0, 14, 138), rot=None)
b = Builder()
rings = []
for i in range(7):
    t = i / 6
    z = 139 + (H - 2 - 139) * t
    rr = 30 + 4 * t
    ring = []
    for k in range(64):
        a = TAU * k / 64
        # circle blending into a racetrack as it rises
        cx = rr * math.cos(a); cy = rr * math.sin(a)
        ox, oy = outline(a, 0.42 + 0.06 * t)
        ring.append((cx * (1 - t) + ox * t, 14 + cy * (1 - t) + oy * t * 0.55, z))
    rings.append(ring)
loft(b, rings, mi=0, cap0=False, cap1=False)
P.add(b, 'upfire_waveguide', [M['horn']], 'upfire', (0, 0, 40), label='up-firing waveguide')

# ---------------------------------------------------------------- port duct (rectangular section, curving up the back)
path = [(0, -14, 20), (0, 12, 20), (0, 36, 26), (0, 47, 44), (0, 49, 70), (0, 49, 96), (0, 52, 106), (0, 60, 108)]
b = Builder()
sweep_rect(b, path, 62, 20, mi=0, w_of=lambda t: 62 - 6 * math.sin(t * math.pi), h_of=lambda t: 20 + 4 * t)
P.add(b, 'duct', [M['duct']], 'duct', (0, 70, 0), label='port duct')

# ---------------------------------------------------------------- amplifier board (generic, left side)
board(P, M, 'board_amp', 'boards', -58, 6, 12, w=48, d=70, explode=(0, 0, -40), chips=7, seed=5, label='amplifier board')

size = export_glb(OUT, P.meta(kind='bose', width=W, depth=D, height=H,
                              woofer={'p': [0, -50, 62], 'dir': [0, -1, 0], 'r': 37},
                              tweeter={'p': [0, -50, 119], 'dir': [0, -1, 0]},
                              upfire={'p': [0, 14, 165], 'dir': [0, 0, 1], 'r': 30},
                              port={'p': [0, 60, 108], 'dir': [0, 1, 0]}))
print('exported', OUT, size, 'bytes,', len(P.list), 'parts')
