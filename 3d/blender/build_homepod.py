# A 360-degree smart speaker in the HomePod (2nd generation) idiom, proportioned
# to Apple's published cutaway rendering (newsroom, January 2023) and the
# published envelope (168 x 142 mm), with the tweeter tilt and horn placement
# following Apple's patent US12192698B2 (diaphragm plane 37.5 to 42.5 degrees
# from horizontal, horns 20 to 45 mm long exiting near the bottom end).
# Everything is original geometry; nothing here is Apple's CAD.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from speaker_common import *

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'homepod.glb')
reset_scene(); make_root('homepod'); M = palette(); P = Parts()

H = 168.0
# Shell profile read off the cutaway (px -> mm at 5.83 px/mm): near-cylindrical,
# 61 mm radius at the foot, 68.5 at mid height, 63.5 under the top, with ~12 mm corner rounds.
def shell_r(z):
    if z < 12:  return 61.0 - 12.0 + math.sqrt(max(0.0, 144.0 - (12.0 - z) ** 2))          # bottom round
    if z > H - 14: return 63.5 - 14.0 + math.sqrt(max(0.0, 196.0 - (z - (H - 14)) ** 2))     # top round
    t = (z - 12) / (H - 26)
    return 61.0 + (68.5 - 61.0) * math.sin(math.pi * t) ** 0.6 * (1 - 0.35 * t) + (63.5 - 61.0) * t

# ---------------------------------------------------------------- shell, in halves
zs = [4 + (H - 8) * i / 60 for i in range(61)]
prof_out = [(shell_r(z), z) for z in zs]
prof_in = [(shell_r(z) - 2.2, z) for z in zs][::-1]
closed = prof_out + prof_in
b = Builder(); lathe_arc(b, closed, math.pi, 2 * math.pi, n=48, mi=0)
P.add(b, 'shell_front', [M['fabric']], 'shell', (0, -70, 0), layer='shell', label='fabric shell (front half)')
b = Builder(); lathe_arc(b, closed, 0.0, math.pi, n=48, mi=0)
P.add(b, 'shell_back', [M['fabric']], 'shell', (0, 70, 0), layer='shell', label='fabric shell (back half)')

# top assembly: a 15 mm cap with the bezel and a recessed touch surface of 94 mm diameter
b = Builder()
lathe(b, [(shell_r(z), z) for z in (H - 15, H - 10, H - 6, H - 3.5, H - 1.8, H - 0.8)] + [(49.0, H), (47.0, H - 1.2), (47.0, H - 4), (40.0, H - 6), (40.0, H - 15)], n=72, mi=0)
P.add(b, 'top_ring', [M['shell']], 'top', (0, 0, 55), layer='shell', label='top bezel')
b = Builder(); cyl(b, 0, 0, 47.2, H - 2.6, H - 1.0, 72, mi=0)
P.add(b, 'top_glass', [M['glass']], 'top', (0, 0, 55), layer='shell', label='touch surface')

# base: a moulded ring with a silicone foot, 8 mm tall
b = Builder(); lathe(b, [(0, 0), (54.0, 0), (58.0, 2.0), (60.5, 8.0), (52.0, 8.0), (52.0, 2.5), (0, 2.5)], n=72, mi=0)
P.add(b, 'base', [M['rubber']], 'base', (0, 0, -45), layer='shell', label='base and silicone foot')

# ---------------------------------------------------------------- chassis: two decks and ribs
b = Builder()
cyl(b, 0, 0, 60.0, 61.5, 64.5, 72, rin=52, mi=0)                       # lower deck ring under the woofer motor region (carries the board)
for k in range(3):
    a = TAU * k / 3 + 0.4
    ring_sector(b, 0, 0, 50, 60.5, a - 0.7, a + 0.7, 138, 141, n=12, mi=0)   # upper deck tabs under the basket flange
for k in range(3):
    a = TAU * k / 3 + 0.4 + math.pi / 3
    rot_box(b, 0, 0, 60.5, 5, a, 63, 138, mi=0, start=57)
P.add(b, 'chassis', [M['plastic']], 'chassis', (0, 0, 0), layer='inner', label='internal frame')

# ---------------------------------------------------------------- woofer, proportioned to the cutaway
# surround outer diameter ~108 mm, flange ~117 mm at z 146; shallow cone with a large domed dust cap;
# cast basket wall from the flange (r 57) down to a shoulder (r 47) at z 104; motor 93 mm across, 34 mm tall (z 70-104).
Z_FL, R_CONE, R_VC = 146.0, 49.0, 16.0
b = Builder(); torus_half(b, 0, 0, Z_FL - 1.0, R_CONE + 3.5, 3.5, n=96, mi=0, flat=1.5)
P.add(b, 'woofer_surround', [M['surround']], 'woofer', (0, 0, 28), label='woofer surround')
b = Builder()
prof = [(R_CONE, Z_FL - 1.0), (R_CONE * 0.97, Z_FL - 1.8)]
for i in range(1, 7):
    t = i / 6
    prof.append((R_CONE * 0.97 + (R_VC - R_CONE * 0.97) * t, Z_FL - 1.8 - 11.0 * t ** 1.1))
prof2 = [(r - 0.7, z - 0.7) for (r, z) in prof][::-1]
lathe(b, prof + [(R_VC - 0.6, Z_FL - 13.2), (R_VC - 0.6, Z_FL - 13.6)] + prof2, n=96, mi=0)
P.add(b, 'woofer_cone', [M['cone']], 'woofer', (0, 0, 26), label='woofer cone')
b = Builder(); dome(b, 0, 0, Z_FL - 12.4, 26.0, 9.5, n=96, mi=0, thick=0.6)
P.add(b, 'woofer_dustcap', [M['cone']], 'woofer', (0, 0, 26), label='woofer dust cap')
z_top = Z_FL - 13.6
b = Builder(); cyl(b, 0, 0, R_VC, z_top - 26, z_top + 0.3, 72, rin=R_VC - 0.4, mi=0)
P.add(b, 'woofer_former', [M['former']], 'woofer', (0, 0, 16), label='voice coil former')
b = Builder(); cyl(b, 0, 0, R_VC + 0.5, z_top - 26, z_top - 15, 72, rin=R_VC, mi=0)
P.add(b, 'woofer_coil', [M['coil']], 'woofer', (0, 0, 16), label='voice coil')
b = Builder()
prof = [(R_VC + 0.6 + (30.0 - R_VC - 0.6) * i / 24, z_top - 6 + 0.9 * math.sin(i / 24 * math.pi * 6)) for i in range(25)]
lathe(b, prof + [(r, z - 0.4) for (r, z) in prof][::-1], n=72, mi=0)
P.add(b, 'woofer_spider', [M['spider']], 'woofer', (0, 0, 20), label='spider')
# basket: flange ring, a cast wall tapering to the shoulder with four windows, lower ring on the motor
b = Builder()
cyl(b, 0, 0, 58.5, Z_FL - 3.0, Z_FL, 96, rin=R_CONE + 4.0, mi=0)
for k in range(4):
    a0 = TAU * k / 4 + 0.62; a1 = a0 + 0.5
    rings = []
    for i in range(13):
        t = i / 12
        r = 57.0 + (47.0 - 57.0) * t; z = Z_FL - 3.0 + (104.0 - (Z_FL - 3.0)) * t
        rings.append([(r * math.cos(a0), r * math.sin(a0), z), (r * math.cos(a1), r * math.sin(a1), z),
                      ((r - 3.0) * math.cos(a1), (r - 3.0) * math.sin(a1), z), ((r - 3.0) * math.cos(a0), (r - 3.0) * math.sin(a0), z)])
    loft(b, rings, mi=0, smooth=False)
lathe(b, [(47.5, 104.0), (49.5, 112.0), (47.5, 112.0), (45.5, 104.0)], n=96, mi=0)
cyl(b, 0, 0, 48.0, 100.0, 104.0, 96, rin=44.0, mi=0)
P.add(b, 'woofer_basket', [M['basket']], 'woofer', (0, 0, 22), label='cast basket')
b = Builder(); cyl(b, 0, 0, 46.5, 100.0, 104.0, 96, rin=R_VC + 1.0, mi=0)
P.add(b, 'woofer_topplate', [M['steel']], 'woofer', (0, 0, 8), label='top plate')
b = Builder(); cyl(b, 0, 0, 46.5, 76.0, 100.0, 96, rin=R_VC + 3.5, mi=0)
P.add(b, 'woofer_magnet', [M['magnet']], 'woofer', (0, 0, 3), label='ring magnet')
b = Builder(); cyl(b, 0, 0, 46.5, 70.0, 76.0, 96, mi=0); cyl(b, 0, 0, R_VC - 1.3, 76.0, z_top - 14.0, 72, mi=0)
P.add(b, 'woofer_backplate', [M['steel']], 'woofer', (0, 0, 0), label='back plate and pole piece')

# bass microphone: a capsule on a bent tube from the basket wall, on the left, as in the cutaway
b = Builder()
sweep(b, [(-48, 0, 106), (-52, 0, 100), (-52, 0, 84), (-48, 0, 78), (-40, 0, 76)], 2.2, n=14, mi=0)
cyl(b, -38, 0, 3.2, 73.5, 78.5, 20, mi=1)
P.add(b, 'mic_bass', [M['plastic'], M['mic']], 'mics', (-20, 0, 0), label='internal bass microphone and tube')

# ---------------------------------------------------------------- tweeters: patent tilt, horns to the bottom
TWEETERS = 5
theta = math.radians(40.0)                 # diaphragm plane to horizontal (US12192698B2: 37.5 to 42.5 degrees)
tweeter_meta = []
for k in range(TWEETERS):
    phi = -math.pi / 2 + TAU * k / TWEETERS
    u = Vector((math.cos(phi), math.sin(phi), 0))
    d = u * math.sin(theta) - Vector((0, 0, math.cos(theta)))     # axis: 40 deg from vertical, outward and down
    centre = u * 19.0 + Vector((0, 0, 54.0))
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    ex = (u * 40).to_tuple()
    dome_tweeter(P, M, f'tweeter{k}', 'tweeters', r_dome=8.0, faceplate_r=13.0, explode=ex, loc=centre.to_tuple(), rot=rot, label=f'tweeter {k + 1}')
    # horn: ~30 mm from the dome, turning from the 50-degree-down axis to a mouth whose normal is 30 degrees below horizontal,
    # centred 32 mm from the axis and 22 mm above the surface, so the mouth's lower edge sits about 10 mm off the table
    p0 = centre + d * 3.0
    mouth_c = u * 29.0 + Vector((0, 0, 27.0))
    n_mouth = (u * math.cos(math.radians(30)) - Vector((0, 0, math.sin(math.radians(30))))).normalized()
    ctrl = p0 + d * 12.0
    path = []
    for i in range(9):
        t = i / 8
        p = (1 - t) ** 2 * p0 + 2 * (1 - t) * t * ctrl + t * t * (mouth_c - n_mouth * 2.0)
        path.append(p.to_tuple())
    b = Builder(); sweep(b, path, 7.0, n=28, mi=0, r_of=lambda t: 7.0 + 5.0 * t ** 1.5)
    P.add(b, f'horn{k}', [M['plastic']], 'horns', ex, label=f'horn {k + 1}')
    # perforated mouth plate: a 24 mm disc with a ring of holes suggested by small darker discs
    rot_m = Vector((0, 0, 1)).rotation_difference(n_mouth).to_euler()
    b = Builder(); cyl(b, 0, 0, 12.0, -1.2, 0.0, 48, mi=0)
    for j in range(7):
        a = TAU * j / 7; cyl(b, 6.5 * math.cos(a), 6.5 * math.sin(a), 1.4, 0.0, 0.25, 12, mi=1)
    cyl(b, 0, 0, 1.6, 0.0, 0.25, 12, mi=1)
    P.add(b, f'mouth{k}', [M['steel'], M['rubber']], 'horns', ex, loc=mouth_c.to_tuple(), rot=rot_m, label=f'horn mouth {k + 1}')
    tweeter_meta.append({'phi': phi, 'tilt': theta, 'centre': centre.to_tuple(), 'dir': d.to_tuple(), 'mouth': mouth_c.to_tuple(), 'mouth_normal': n_mouth.to_tuple()})

# ---------------------------------------------------------------- electronics: the board ring at the deck (z ~58) and a heat spreader
board(P, M, 'board_main', 'boards', 0, 0, 65.0, r=57, explode=(0, 0, -24), chips=10, seed=3, label='logic and amplifier board')
b = Builder()
for k in range(10):
    rot_box(b, 0, 0, 44, 1.2, TAU * k / 10 + 0.1, 67.0, 69.6, mi=0, start=30)
P.add(b, 'heatsink', [M['steel']], 'boards', (0, 0, -24), label='heat spreader')

# ---------------------------------------------------------------- microphone array around the upper body
b = Builder(); mics = []
for k in range(4):
    a = TAU * k / 4 + math.pi / 4
    x, y = 62 * math.cos(a), 62 * math.sin(a)
    cyl(b, x, y, 2.2, 118, 124, 16, mi=0); mics.append((x, y, 121))
P.add(b, 'mic_array', [M['mic']], 'mics', (0, 0, 0), label='microphone array')

size = export_glb(OUT, P.meta(kind='homepod', height=H, radius=68.5, tweeters=tweeter_meta, woofer={'z': Z_FL, 'r': R_CONE}, mics=mics,
                              provenance='proportioned to Apple newsroom cutaway (2023-01-18) and US12192698B2; generic construction'))
print('exported', OUT, size, 'bytes,', len(P.list), 'parts')
