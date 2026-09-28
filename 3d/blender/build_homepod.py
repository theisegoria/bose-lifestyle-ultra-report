# Generic 360-degree smart speaker in the HomePod idiom: up-firing woofer under
# the top, five down-firing horn tweeters in a ring at the base, stacked boards,
# microphone array, fabric shell.  Original geometry; envelope 168 x 142 mm.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from speaker_common import *

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'homepod.glb')
reset_scene(); make_root('homepod'); M = palette(); P = Parts()

H, RMAX = 168.0, 71.0
def shell_r(z):
    """Outer fabric radius: a barrel with rounded ends."""
    t = (z - H / 2) / (H / 2)
    return 60.0 + (RMAX - 60.0) * math.sqrt(max(0.0, 1 - t * t)) ** 0.75

# ---------------------------------------------------------------- shell, in halves
prof = [(shell_r(z), z) for z in [4 + (H - 8) * i / 40 for i in range(41)]]
prof_out = [(r, z) for (r, z) in prof]
prof_in = [(r - 2.2, z) for (r, z) in prof][::-1]
closed = prof_out + prof_in
b = Builder(); lathe_arc(b, closed, math.pi, 2 * math.pi, n=48, mi=0)
P.add(b, 'shell_front', [M['fabric']], 'shell', (0, -70, 0), layer='shell', label='fabric shell (front half)')
b = Builder(); lathe_arc(b, closed, 0.0, math.pi, n=48, mi=0)
P.add(b, 'shell_back', [M['fabric']], 'shell', (0, 70, 0), layer='shell', label='fabric shell (back half)')

# top ring and touch surface
b = Builder()
lathe(b, [(shell_r(H - 4), H - 4), (58.0, H - 1.5), (44.0, H), (40.0, H - 0.8), (40.0, H - 6), (56.0, H - 8), (shell_r(H - 8), H - 8)], n=64, mi=0)
P.add(b, 'top_ring', [M['shell']], 'top', (0, 0, 55), layer='shell', label='top bezel')
b = Builder(); cyl(b, 0, 0, 40.2, H - 2.0, H - 0.4, 64, mi=0)
P.add(b, 'top_glass', [M['glass']], 'top', (0, 0, 55), layer='shell', label='touch surface')

# base
b = Builder(); lathe(b, [(0, 0), (52.0, 0), (56.0, 1.5), (58.0, 4.0), (0, 4.0)], n=64, mi=0)
P.add(b, 'base', [M['rubber']], 'base', (0, 0, -45), layer='shell', label='silicone base')

# ---------------------------------------------------------------- chassis
b = Builder()
# lower deck: tweeter mount plate with five cut-outs between the horns
for k in range(5):
    a = TAU * k / 5 - math.pi / 2 + TAU / 10
    ring_sector(b, 0, 0, 20, 56, a - 0.22, a + 0.22, 56, 60, n=8, mi=0)
cyl(b, 0, 0, 22, 56, 60, 48, rin=18, mi=0)
# upper deck: woofer mounting plate, three windows
for k in range(3):
    a = TAU * k / 3 + 0.4
    ring_sector(b, 0, 0, 50, 60, a - 0.75, a + 0.75, 136, 140, n=12, mi=0)
# three vertical ribs joining the decks
for k in range(3):
    a = TAU * k / 3 + 0.4 + math.pi / 3
    rot_box(b, 0, 0, 60, 6, a, 60, 136, mi=0, start=55)
P.add(b, 'chassis', [M['plastic']], 'chassis', (0, 0, 0), layer='inner', label='internal frame')

# ---------------------------------------------------------------- woofer (up-firing)
cone_driver(P, M, 'woofer', 'woofer', 0, 0, z_flange=146, r_cone=40, depth=20, r_vc=15, motor_h=30, magnet_r=36,
            explode_up=1.6, label='woofer')

# ---------------------------------------------------------------- tweeter ring
TWEETERS = 5
tilt = math.radians(38)
tweeter_meta = []
for k in range(TWEETERS):
    phi = -math.pi / 2 + TAU * k / TWEETERS         # first one faces the front
    u = Vector((math.cos(phi), math.sin(phi), 0))
    d = u * math.cos(tilt) - Vector((0, 0, math.sin(tilt)))
    centre = u * 37.0 + Vector((0, 0, 46.0))
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    ex = (u * 45).to_tuple()
    dome_tweeter(P, M, f'tweeter{k}', 'tweeters', r_dome=9.0, explode=ex, loc=centre.to_tuple(), rot=rot, label=f'tweeter {k + 1}')
    # horn: a flaring tube from the dome outward and curving down to the base rim
    p0 = centre + d * 2.5
    p2 = u * 57.0 + Vector((0, 0, 9.0))
    ctrl = p0 + d * 16.0
    path = []
    for i in range(9):
        t = i / 8
        p = (1 - t) ** 2 * p0 + 2 * (1 - t) * t * ctrl + t * t * p2
        path.append(p.to_tuple())
    b = Builder(); sweep(b, path, 10.0, n=24, mi=0, r_of=lambda t: 10.0 + 7.0 * t ** 1.3)
    P.add(b, f'horn{k}', [M['horn']], 'horns', ex, label=f'horn {k + 1}')
    tweeter_meta.append({'phi': phi, 'tilt': tilt, 'centre': centre.to_tuple(), 'dir': d.to_tuple(), 'mouth': p2.to_tuple()})

# ---------------------------------------------------------------- electronics
board(P, M, 'board_main', 'boards', 0, 0, 74, r=44, explode=(0, 0, -26), chips=9, seed=3, label='logic and amplifier board')
b = Builder()
for k in range(8):
    rot_box(b, 0, 0, 30, 1.2, TAU * k / 8, 78, 86, mi=0, start=6)
cyl(b, 0, 0, 7, 78, 80, 24, mi=0)
P.add(b, 'heatsink', [M['steel']], 'boards', (0, 0, -26), label='heat spreader')
board(P, M, 'board_power', 'boards', 0, 0, 6, w=44, d=30, explode=(0, 0, -40), chips=5, seed=7, label='power board')

# ---------------------------------------------------------------- microphones
b = Builder()
mics = []
for k in range(4):
    a = TAU * k / 4 + math.pi / 4
    x, y = 60 * math.cos(a), 60 * math.sin(a)
    cyl(b, x, y, 2.2, 96, 102, 16, mi=0)
    mics.append((x, y, 99))
P.add(b, 'mic_array', [M['mic']], 'mics', (0, 0, 0), label='microphone array')
b = Builder(); cyl(b, 0, 28, 2.0, 120, 126, 16, mi=0)
P.add(b, 'mic_bass', [M['mic']], 'mics', (0, 0, 0), label='internal bass microphone')

size = export_glb(OUT, P.meta(kind='homepod', height=H, radius=RMAX, tweeters=tweeter_meta, woofer={'z': 146, 'r': 40}, mics=mics))
print('exported', OUT, size, 'bytes,', len(P.list), 'parts')
