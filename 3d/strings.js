/* Copy for the speaker companion, English and Japanese, keyed by product and chapter.
 * Every entry is [en, ja].  No em-dashes. */
const APPLE = 'https://www.apple.com/homepod-2nd-generation/specs/';
const APPLE_ROOM = 'https://www.apple.com/newsroom/2023/01/apple-introduces-the-new-homepod-with-breakthrough-sound-and-intelligence/';
const BOSE = 'https://www.bose.com/pressroom/bose-lifestyle-collection';
const BOSE_PRODUCT = 'https://www.bose.com/p/sale/bose-lifestyle-ultra-speaker/LSULT-SPEAKERWIRELESS.html';
const TEARDOWN = 'https://www.ifixit.com/News/71957/the-homepod-2-teardown-small-changes-make-a-big-difference';

export const UI = {
  chapters: { design: ['Design', '設計'], inside: ['Inside', '内部'], bass: ['Bass', '低音'], field: ['Field', '音場'], room: ['Room', '空間'] },
  modes: { design: ['Exterior', '外観'], inside: ['Cutaway', '断面'], exploded: ['Exploded', '分解'], bass: ['Bass mechanism', '低音の機構'], field: ['Computed sound field', '計算した音場'], room: ['Room reflections', '室内反射'] },
  next: { design: ['Next: look inside', '次へ：内部を見る'], inside: ['Next: the bass mechanism', '次へ：低音の機構'], bass: ['Next: the sound field', '次へ：音場'], field: ['Next: the room', '次へ：部屋の中で'], room: ['Return to the cabinet', '筐体に戻る'] },
  play: ['Play motion', '動かす'], pause: ['Pause motion', '止める'],
  hint3d: ['Drag to rotate · + / − to zoom', 'ドラッグで回転 · + / − で拡大縮小'],
  hintRoom: ['Drag to orbit · paths are computed from image sources', 'ドラッグで回転 · 経路は鏡像音源から計算'],
  scale: { homepod: ['Envelope · 168 × 142 mm', '外形 · 168 × 142 mm'], bose: ['Envelope · 184.7 × 121.1 × 167.5 mm', '外形 · 184.7 × 121.1 × 167.5 mm'], room: ['Room model · metres', '部屋のモデル · メートル'], field: ['Linear acoustics · ideal sources', '線形音響 · 理想音源'] },
  evidence: ['Generic reconstruction', '一般化した再構成'],
  parts: ['Parts', '部品'],
  fieldLegend: ['Sound pressure level, relative to the maximum on the plane', '面上の最大値に対する音圧レベル'],
  dbScale: ['0 dB', '−12', '−24', '−36'],
  polarTitle: ['Far-field pattern at 2 m, horizontal plane', '2 m の遠距離場パターン（水平面）'],
  heightTitle: ['Direct plus ceiling bounce at the listener', '受聴点での直接音と天井反射の和'],
  echoTitle: ['Echogram at the listener', '受聴点のエコーグラム'],
  bassTitle: ['Cone displacement over one cycle', '1 周期のコーン変位'],
  omni: ['Every tweeter plays the same signal', '全ツイーターが同じ信号'],
  steered: ['Delays steer the beam', '遅延でビームを向ける'],
  levels: { direct: ['direct', '直接音'], first: ['1st order', '1 次反射'], second: ['2nd order', '2 次反射'] },
  ms: ['ms', 'ms'],
  blockedNote: ['Nothing blocks the modelled paths; the room is an empty box.', 'モデル上の経路を遮るものはない。部屋は空の箱である。'],
};

export const PRODUCTS = {
  homepod: {
    name: ['APPLE / HOMEPOD 2', 'APPLE / HOMEPOD 2'],
    chapters: {
      design: ['01 / AROUND THE CABINET', 'A ring of sound.', 'A rounded fabric shell hides a vertical acoustic stack. Turn it, change the finish, then open the cabinet.', '01 / 筐体のまわり', '音のリング', '丸みのあるファブリックの外殻の中に、縦に積んだ音響系がある。回して、仕上げを変え、筐体を開いてみよう。'],
      inside: ['02 / THE ACOUSTIC STACK', 'One woofer. Five tweeters.', 'The woofer fires upward under the top; five horn tweeters sit in a ring at the base and fire down toward the surface. Separate the parts to see how each driver is built.', '02 / 音響系の積み重ね', 'ウーファー 1 基、ツイーター 5 基', 'ウーファーは天面の下で上向きに鳴り、5 基のホーン型ツイーターは底部のリングに並んで設置面へ向けて鳴る。部品を分離して、各ドライバーの構造を見てみよう。'],
      bass: ['03 / LOW FREQUENCIES', 'Move air. Measure. Adjust.', 'A voice coil in a magnetic gap pushes the cone; the spider and surround centre it and pull it back. An internal microphone hears the result and the processor corrects the drive. Scrub one slowed cycle.', '03 / 低い周波数', '空気を動かし、測り、直す', '磁気ギャップの中のボイスコイルがコーンを押し、ダンパーとエッジが中心に保って引き戻す。内部マイクがその結果を聞き、プロセッサが駆動信号を補正する。1 周期をゆっくり動かしてみよう。'],
      field: ['04 / THE TWEETER RING', 'Five sources, one beam.', 'This is a computed field, not an illustration: five ideal sources at the horn mouths, summed with their delays. With no delays every tweeter plays the same thing and the ring is omnidirectional. Delaying the rear tweeters steers a beam toward the listener.', '04 / ツイーターのリング', '5 つの音源、1 本のビーム', 'これは図解ではなく計算した音場である。ホーン開口に置いた 5 つの理想音源を、遅延つきで足し合わせている。遅延がなければ全ツイーターは同じ信号を出し、リングは無指向性になる。後ろのツイーターを遅らせると、ビームが受聴者の方へ向く。'],
      room: ['05 / SOUND IN SPACE', 'The room answers back.', 'Every wall returns a copy of the sound, later and quieter. The paths are computed by mirroring the source in each wall (image sources); the echogram lists what arrives at the listener and when.', '05 / 空間の中の音', '部屋が答え返す', 'どの壁も音の写しを、遅れて小さく返してくる。経路は各壁で音源を鏡像化して（鏡像音源）計算し、エコーグラムは受聴点に何がいつ届くかを並べる。'],
    },
    components: {
      shell: ['Fabric shell', 'Acoustically transparent mesh', 'The published envelope is 168 mm tall and 142 mm across; the near-cylindrical profile with its rounded top and foot is read off Apple\'s cutaway. Built as two halves so the front can be removed.', 'ファブリックの外殻', '音を通すメッシュ', '公表寸法は高さ 168 mm、幅 142 mm。丸めた天面と脚をもつ円筒に近い輪郭は Apple のカットモデルから読み取った。前半分を外せるよう二つ割りで作ってある。', APPLE, 'Envelope published · profile from the cutaway', '外形は公表値 · 輪郭はカットモデルから'],
      top: ['Top surface', 'Touch panel and bezel', 'A 15 mm cap with a 94 mm recessed touch surface, as the cutaway shows. Sound from the woofer leaves through the fabric just below it.', '天面', 'タッチパネルとベゼル', 'カットモデルのとおり、94 mm のくぼんだタッチ面をもつ 15 mm のキャップ。ウーファーの音はそのすぐ下のファブリックから出ていく。', APPLE, 'Proportioned to the cutaway', 'カットモデルに合わせた比率'],
      woofer: ['Woofer', 'High-excursion woofer, firing up', 'Proportioned to the cutaway: a 108 mm surround on a shallow cone with a large domed dust cap, a cast basket tapering to a 93 mm, 34 mm tall motor. Cone, surround, spider, coil and former are generic parts sized to fit.', 'ウーファー', '大振幅ウーファー、上向き', 'カットモデルに合わせた比率。浅いコーンに 108 mm のエッジと大きなドーム状ダストキャップ、直径 93 mm・高さ 34 mm の磁気回路へ絞り込む鋳造フレーム。コーン、エッジ、ダンパー、コイル、ボビンはそれに合わせた一般部品である。', APPLE_ROOM, 'Proportioned to the cutaway · construction generic', 'カットモデルに合わせた比率 · 構造は一般化'],
      tweeters: ['Tweeters', 'Five dome tweeters, tilted 40°', 'Five small domes near the base, each tilted so its diaphragm sits 40° from horizontal, inside the 37.5° to 42.5° range Apple\'s patent describes. Positions follow the cutaway; the domes and motors are generic.', 'ツイーター', '40° に傾いた 5 基のドーム型ツイーター', '底部近くの 5 つの小さなドーム。振動板が水平から 40° になるよう傾けてあり、Apple の特許が記す 37.5° から 42.5° の範囲に入る。位置はカットモデル、ドームと磁気回路は一般化。', 'https://patents.google.com/patent/US12192698B2/en', 'Tilt from US12192698B2 · positions from the cutaway', '傾きは US12192698B2 · 位置はカットモデル'],
      horns: ['Horns', 'Waveguides to the base', 'A 30 mm flaring passage turns each tweeter\'s output to a 24 mm perforated mouth 27 mm above the table, so its lower edge sits about 10 mm off the surface, the 8 to 13 mm the patent argues for. The mouths are where the cutaway shows them; the passage shape is generic.', 'ホーン', '底部への導波路', '30 mm の広がる通路が各ツイーターの音を、テーブルから 27 mm の高さにある 24 mm の穴あき開口へ導く。開口の下縁は面から約 10 mm で、特許が主張する 8 から 13 mm の範囲にある。開口はカットモデルの位置、通路の形は一般化。', 'https://patents.google.com/patent/US12192698B2/en', 'Mouths from the cutaway · height from the patent', '開口はカットモデル · 高さは特許'],
      boards: ['Electronics', 'Logic, amplification, power', 'A board ring at the deck between the woofer motor and the tweeters, where the cutaway and iFixit\'s teardown place it. Component layout is generic.', '電子回路', 'ロジック、増幅、電源', 'ウーファー磁気回路とツイーターの間のデッキにある基板リング。カットモデルと iFixit の分解が示す位置である。部品配置は一般化。', TEARDOWN, 'Position from the cutaway and teardown · layout generic', '位置はカットモデルと分解 · 配置は一般化'],
      mics: ['Microphones', 'Array and bass microphone', 'Four microphones around the body listen to the room. The internal bass microphone sits on a bent tube from the basket wall on the left, which is what the cutaway shows.', 'マイクロフォン', 'アレイと低音マイク', '本体まわりの 4 本のマイクが部屋を聞く。内部の低音マイクは左側、フレーム壁から出る曲がった管の先にあり、これはカットモデルに見えるとおりである。', APPLE, 'Bass mic from the cutaway · array positions illustrative', '低音マイクはカットモデル · アレイ位置は例示'],
      chassis: ['Frame', 'Internal frame', 'Two decks and three ribs hold the drivers and board in a column. Generic structure.', 'フレーム', '内部フレーム', '2 枚のデッキと 3 本のリブがドライバーと基板を縦一列に保持する。一般化した構造。', APPLE_ROOM, 'Generic', '一般化'],
      base: ['Base', 'Base and silicone foot', 'The cabinet stands on an 8 mm moulded base with a soft foot; the horn mouths open just above it.', '底部', '底部とシリコンの脚', '筐体は柔らかい脚をもつ 8 mm の成形ベースの上に立ち、ホーン開口はそのすぐ上で開く。', APPLE, 'Proportioned to the cutaway', 'カットモデルに合わせた比率'],
    },
  },
  bose: {
    name: ['BOSE / LIFESTYLE ULTRA', 'BOSE / LIFESTYLE ULTRA'],
    chapters: {
      design: ['01 / THE CABINET', 'A front. And an up.', 'A capsule with a fabric front and a moulded top. Two radiators face you; a third faces the ceiling. Turn it, change the finish, then open the cabinet.', '01 / 筐体', '前へ、そして上へ', 'ファブリックの前面と成形した天面をもつカプセル。2 つの放射器はこちらを向き、3 つ目は天井を向く。回して、仕上げを変え、筐体を開いてみよう。'],
      inside: ['02 / THREE RADIATORS', 'Woofer, tweeter, height driver.', 'A forward woofer under a forward tweeter, an up-firing driver under the top grille with a flared waveguide, and a rectangular duct curving up the back to a rear port. Separate the parts to see each one.', '02 / 3 つの放射器', 'ウーファー、ツイーター、ハイトドライバー', '前向きツイーターの下に前向きウーファー、天面グリルの下にフレア付き導波路をもつ上向きドライバー、そして背面ポートへ向かって背中を上る矩形ダクト。部品を分離して、一つずつ見てみよう。'],
      bass: ['03 / A DRIVER AND A PORT', 'The cone pushes; the duct sings along.', 'The voice coil drives the cone; the air in the duct is a second mass on the spring of the cabinet air, tuned to help near the bottom of the range. Scrub one slowed cycle of the cone.', '03 / ドライバーとポート', 'コーンが押し、ダクトが共に鳴る', 'ボイスコイルがコーンを駆動する。ダクト内の空気は筐体内空気のばねに載った第二の質量で、帯域の下端付近を助けるよう同調されている。コーンの 1 周期をゆっくり動かしてみよう。'],
      field: ['04 / THE HEIGHT PATH', 'A bounce off the ceiling.', 'A computed field on the vertical plane through the speaker: the up-firing driver, the forward tweeter, and their reflections in the ceiling and floor. At the listener the direct sound and the ceiling bounce add with a delay, which is why the height channel is not flat.', '04 / 高さの経路', '天井での一回反射', 'スピーカーを通る鉛直面上で計算した音場。上向きドライバー、前向きツイーター、そしてそれらの天井と床での反射である。受聴点では直接音と天井反射が遅延をもって足し合わさるため、ハイトチャンネルは平坦にならない。'],
      room: ['05 / SOUND IN SPACE', 'The room answers back.', 'Every wall returns a copy of the sound, later and quieter. The paths are computed by mirroring the source in each wall (image sources); the echogram lists what arrives at the listener and when.', '05 / 空間の中の音', '部屋が答え返す', 'どの壁も音の写しを、遅れて小さく返してくる。経路は各壁で音源を鏡像化して（鏡像音源）計算し、エコーグラムは受聴点に何がいつ届くかを並べる。'],
    },
    components: {
      shell: ['Fabric shell', 'Front and rear halves', 'The published envelope is 184.7 mm tall, 121.1 mm wide and 167.5 mm deep. The egg-shaped footprint, broad at the front and rounder at the back, is taken from the top photograph. Two halves so the front can be removed.', 'ファブリックの外殻', '前後の二つ割り', '公表された外形は高さ 184.7 mm、幅 121.1 mm、奥行 167.5 mm。前が広く後ろが丸い卵形の平面形は上面写真から取った。前半分を外せるよう二つ割り。', BOSE_PRODUCT, 'Envelope published · footprint from the photographs', '外形は公表値 · 平面形は写真から'],
      top: ['Top cap', 'Grille and controls', 'The 69 mm up-firing grille sits 41 mm behind the front edge and the 49 mm control disc 41 mm ahead of the rear edge, as in the top photograph. Control symbols are omitted.', '天面キャップ', 'グリルと操作部', '上面写真のとおり、69 mm の上向きグリルは前縁から 41 mm、49 mm の操作ディスクは後縁から 41 mm の位置にある。操作記号は省略。', BOSE_PRODUCT, 'Positions from the top photograph', '位置は上面写真から'],
      woofer: ['Woofer', 'Forward bass driver', 'The larger radiator, low on the baffle on the centre line, with the tweeter directly above it, as the cutaway shows, about 85 mm across the frame with a deep motor. Cone, surround, spider, coil and magnet are generic parts sized to fit.', 'ウーファー', '前向き低音ドライバー', 'カットモデルのとおりバッフル下部の中心線上にあり、真上にツイーターが来る大きい方の放射器。フレーム径約 85 mm、磁気回路は深い。コーン、エッジ、ダンパー、コイル、磁石はそれに合わせた一般部品。', BOSE_PRODUCT, 'Position and size from the cutaway · construction generic', '位置と大きさはカットモデル · 構造は一般化'],
      tweeter: ['Tweeter', 'Forward dome tweeter', 'A 24 mm dome in a shallow round waveguide, on the centre line directly above the woofer, just in front of the up-firing driver\'s motor, as the cutaway shows.', 'ツイーター', '前向きドーム型ツイーター', '浅い円形導波路の中の 24 mm ドーム。カットモデルのとおり、ウーファーの真上の中心線上、上向きドライバーの磁気回路のすぐ前にある。', BOSE, 'Position from the cutaway', '位置はカットモデル'],
      upfire: ['Height driver', 'Up-firing driver and waveguide', 'A smaller cone driver directly under the top grille, 41 mm behind the front edge, with a flared waveguide that widens to the grille. The cutaway shows its cylindrical motor behind the tweeter.', 'ハイトドライバー', '上向きドライバーと導波路', '天面グリルの真下、前縁から 41 mm にある小さめのコーン型ドライバーで、グリルへ向けて広がるフレア付き導波路をもつ。カットモデルではツイーターの後ろに円筒形の磁気回路が見える。', BOSE, 'Position from the grille and cutaway', '位置はグリルとカットモデル'],
      duct: ['Port', 'The duct up the back', 'From the 63 × 21 mm rear opening 56 mm above the table (rear photograph), the duct climbs the rear wall and hooks over at the top to open into the cabinet, the route the cutaway shows. Its cross-section and tuning are not published.', 'ポート', '背中を上るダクト', 'テーブルから 56 mm の高さにある 63 × 21 mm の背面開口（背面写真）から、ダクトは背面の壁を上り、天面近くで曲がり返して筐体内に開く。カットモデルに見える経路である。断面と同調周波数は公表されていない。', BOSE_PRODUCT, 'Port from the rear photograph · route from the cutaway', 'ポートは背面写真 · 経路はカットモデル'],
      boards: ['Electronics', 'Amplifier board', 'A generic amplifier board on the base tray. Bose does not show the electronics; this is a placeholder so the cabinet does not read as empty.', '電子回路', 'アンプ基板', '底面トレイの上の一般化したアンプ基板。Bose は電子回路を公開していないので、筐体が空に見えないための仮の部品である。', BOSE, 'Generic placeholder', '一般化した仮の部品'],
      chassis: ['Frame', 'Chassis frame', 'A moulded frame behind the front fabric carries the two forward drivers, as in the cutaway; its exact shape is generic.', 'フレーム', 'シャーシフレーム', 'カットモデルのとおり、前面ファブリックの裏の成形フレームが 2 つの前向きドライバーを支える。正確な形状は一般化。', BOSE_PRODUCT, 'Generic', '一般化'],
      base: ['Plinth', 'Base', 'The 19 mm inset plinth under the fabric, from the front photograph.', '台座', '底部', '前面写真から取った、ファブリックの下の 19 mm の内側に入った台座。', BOSE_PRODUCT, 'Proportioned to the photograph', '写真に合わせた比率'],
    },
  },
};
