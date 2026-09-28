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
  scale: { homepod: ['Envelope · 168 × 142 mm', '外形 · 168 × 142 mm'], bose: ['Envelope · about 184 × 121 × 167 mm', '外形 · 約 184 × 121 × 167 mm'], room: ['Room model · metres', '部屋のモデル · メートル'], field: ['Linear acoustics · ideal sources', '線形音響 · 理想音源'] },
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
      shell: ['Fabric shell', 'Acoustically transparent mesh', 'The published envelope is 168 mm tall and 142 mm across. The shell here is a generic woven barrel in two halves so the front can be removed.', 'ファブリックの外殻', '音を通すメッシュ', '公表寸法は高さ 168 mm、幅 142 mm。ここでは前半分を外せるよう、二つ割りの一般的な織り筒として作っている。', APPLE],
      top: ['Top surface', 'Touch panel and bezel', 'A recessed touch surface in a moulded bezel. Sound from the woofer leaves through the fabric just below it.', '天面', 'タッチパネルとベゼル', '成形ベゼルの中にくぼんだタッチ面がある。ウーファーの音はそのすぐ下のファブリックから出ていく。', APPLE],
      woofer: ['Woofer', 'High-excursion woofer, firing up', 'Cone, surround, spider, voice coil on its former, and a motor of top plate, ring magnet and back plate with a pole piece. The cone faces the top; its motor hangs below.', 'ウーファー', '大振幅ウーファー、上向き', 'コーン、エッジ、ダンパー、ボビン上のボイスコイル、そしてトッププレート・リング磁石・ポールピース付きバックプレートからなる磁気回路。コーンは天面を向き、磁気回路はその下に吊られている。', APPLE_ROOM],
      tweeters: ['Tweeters', 'Five dome tweeters', 'Each is a small dome on a voice coil in its own magnet cup, tilted so its axis points outward and down.', 'ツイーター', '5 基のドーム型ツイーター', 'それぞれ小さなドームとボイスコイル、専用の磁石カップからなり、軸が外側かつ下向きになるよう傾けてある。', APPLE_ROOM],
      horns: ['Horns', 'Waveguides to the base', 'A flaring passage carries each tweeter\'s output down to the rim of the base, where it leaves the cabinet. The horn shape here is generic.', 'ホーン', '底部への導波路', '広がる通路が各ツイーターの音を底部の縁まで導き、そこで筐体から外へ出す。ホーン形状は一般化したものである。', APPLE_ROOM],
      boards: ['Electronics', 'Logic, amplification, power', 'A round main board with a heat spreader sits between the woofer motor and the tweeter ring; a small power board sits at the base. Layouts are generic.', '電子回路', 'ロジック、増幅、電源', '放熱板付きの円形メイン基板がウーファー磁気回路とツイーターリングの間にあり、小さな電源基板が底にある。配置は一般化したもの。', TEARDOWN],
      mics: ['Microphones', 'Array and bass microphone', 'Four microphones around the body listen to the room; an internal microphone near the woofer hears the bass the speaker actually makes. Positions are illustrative.', 'マイクロフォン', 'アレイと低音マイク', '本体まわりの 4 本のマイクが部屋を聞き、ウーファー近くの内部マイクがスピーカーが実際に出している低音を聞く。位置は例示。', APPLE],
      chassis: ['Frame', 'Internal frame', 'Two decks and three ribs hold the drivers and boards in a column. Generic structure.', 'フレーム', '内部フレーム', '2 枚のデッキと 3 本のリブがドライバーと基板を縦一列に保持する。一般化した構造。', APPLE_ROOM],
      base: ['Base', 'Silicone foot', 'The cabinet stands on a soft ring; the horn mouths sit just above it.', '底部', 'シリコンの脚', '筐体は柔らかいリングの上に立ち、ホーン開口はそのすぐ上にある。', APPLE],
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
      shell: ['Fabric shell', 'Front and rear halves', 'The reported envelope is about 184 × 121 × 167 mm. The shell is a generic racetrack capsule in two halves so the front can be removed.', 'ファブリックの外殻', '前後の二つ割り', '報告されている外形は約 184 × 121 × 167 mm。外殻は前半分を外せるよう、二つ割りの一般的なレーストラック形カプセルとした。', BOSE_PRODUCT],
      top: ['Top cap', 'Grille and controls', 'The moulded top carries the grille over the up-firing driver. Controls are omitted.', '天面キャップ', 'グリルと操作部', '成形した天面が上向きドライバーの上のグリルを支える。操作部は省略。', BOSE_PRODUCT],
      woofer: ['Woofer', 'Forward bass driver', 'The larger radiator, low on the baffle: cone, surround, spider, voice coil and a ring-magnet motor. Its cone faces the listener.', 'ウーファー', '前向き低音ドライバー', 'バッフル下部の大きい方の放射器。コーン、エッジ、ダンパー、ボイスコイル、リング磁石の磁気回路からなり、コーンは受聴者を向く。', BOSE_PRODUCT],
      tweeter: ['Tweeter', 'Forward dome tweeter', 'A dome in a shallow waveguide above the woofer, giving a direct forward path for the highs.', 'ツイーター', '前向きドーム型ツイーター', 'ウーファーの上、浅い導波路の中のドーム。高域に直接の前方経路を与える。', BOSE],
      upfire: ['Height driver', 'Up-firing driver and waveguide', 'A smaller cone driver under the top grille, with a flared waveguide that widens its mouth toward the ceiling.', 'ハイトドライバー', '上向きドライバーと導波路', '天面グリルの下の小さめのコーン型ドライバーで、開口を天井へ向けて広げるフレア付き導波路をもつ。', BOSE],
      duct: ['Port', 'Curved duct to the rear', 'A rectangular duct runs from the cabinet interior up the back to a rear opening. Its route here is generic; the real cross-section and tuning are not published.', 'ポート', '背面へ曲がるダクト', '矩形ダクトが筐体内部から背中を上って背面の開口に至る。ここでの経路は一般化したもので、実際の断面や同調周波数は公表されていない。', BOSE_PRODUCT],
      boards: ['Electronics', 'Amplifier board', 'A generic amplifier board on the floor of the cabinet, beside the duct.', '電子回路', 'アンプ基板', 'ダクトの横、筐体底面に置いた一般化したアンプ基板。', BOSE],
      chassis: ['Baffle', 'Baffle and ribs', 'A vertical baffle behind the front fabric carries the two forward drivers.', 'バッフル', 'バッフルとリブ', '前面ファブリックの裏の鉛直バッフルが、2 つの前向きドライバーを支える。', BOSE_PRODUCT],
      base: ['Plinth', 'Base', 'The moulded plinth under the fabric.', '台座', '底部', 'ファブリックの下の成形台座。', BOSE_PRODUCT],
    },
  },
};
