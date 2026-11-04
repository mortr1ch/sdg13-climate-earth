/* Presentation mode: an intro title, then the guideline sections as chapters.
   Each chapter shows a slide on the left and flies the globe to the place it talks about.
   Keys: 1–5 open a numbered chapter, I = intro, ← / → step through, 0 returns to free exploring.
   Chapter 5 (Project) scrolls by itself; Space pauses / resumes the auto-scroll.
   Esc closes an enlarged photo first, otherwise returns to free exploring. */
(function () {
  'use strict';

  const GREEN = '#56c25f';
  const ECOPULSE_URL = 'https://ecopulse-uzbekistan-action.divinemirth.chatgpt.site';
  const UZ_VIEW = { lat: 41.4, lon: 64.6, dist: 2.25 };
  const TASHKENT_VIEW = { lat: 41.31, lon: 69.24, dist: 1.5 };

  /* Pins shown on the globe for some steps */
  const PIN = {
    riyadh:   { lat: 24.71, lon: 46.68, html: '🇸🇦 <b>Riyadh</b> · heat → greening' },
    tashkent: { lat: 41.31, lon: 69.24, html: '🇺🇿 <b>Tashkent</b> · us' },
    heat:     { lat: 41.31, lon: 69.24, html: '🌡️ <b>Tashkent</b> · 44.3°C on 19 July 2026', hot: true },
    aral:     { lat: 45.0, lon: 59.5, html: '🌊 <b>Aral Sea region</b> · up to +2.5°C', hot: true },
    aralwater:{ lat: 45.0, lon: 59.5, html: '💧 <b>Amu Darya &amp; Syr Darya</b>' },
    smog:     { lat: 41.31, lon: 69.24, html: '🌫️ <b>Tashkent</b> · PM2.5 6× the WHO guideline', hot: true },
    seoul:    { lat: 37.57, lon: 126.98, html: '🇰🇷 <b>South Korea</b> · Carbon Neutral Points' }
  };

  const CHAPTERS = [
    {
      key: 'intro', intro: true, short: 'SDG 13', title: 'SDG 13 · Climate Action',
      view: { lat: 28, lon: 62, dist: 8.5 }
    },
    {
      key: 'global', num: 1, short: 'Global snapshot', title: 'Global Progress Snapshot',
      cfg: [{ view: { lat: 18, lon: 20, dist: 4.6 }, photos: 'global', flag: '🌍', layout: 'six' }],
      render: () => `
        <div class="verdict bad"><b>Are we on track globally?</b><span>No. Warming and emissions are still rising. Resilience and finance are improving, but too slowly.</span></div>
        <div class="trend-grid">
          ${trend('up-bad', 'Temperature', '+1.55°C', '2024 was the hottest year on record and the first full year above 1.5°C.', 'WMO, 2025')}
          ${trend('up-bad', 'Emissions', '57.7 Gt', 'Record greenhouse-gas emissions in 2024, up 2.3% in one year.', 'UNEP Emissions Gap Report 2025')}
          ${trend('gap', 'Ambition gap', '2.8°C', 'Where current policies lead by 2100. New pledges: 2.3–2.5°C. Keeping to 1.5°C needs a 55% cut by 2035 (vs 2019).', 'UNEP Emissions Gap Report 2025')}
          ${trend('up-good', 'Resilience', '141', 'countries have disaster-risk-reduction strategies (56 in 2015); 113 have multi-hazard early-warning systems.', 'UN SDG Report 2025')}
          ${trend('up-good', 'Finance', '$300bn', 'New yearly climate-finance goal for 2035 (COP29). The old $100bn goal was first met in 2022.', 'UNFCCC; OECD')}
        </div>
        <p class="s-title">SDG 13 targets at a glance</p>
        <div class="targets">
          ${target('13.1', 'Resilience & disaster risk', 'Improving', 'good')}
          ${target('13.2', 'Climate policies & emissions', 'Off track', 'bad')}
          ${target('13.3', 'Climate education', 'Limited data', 'mid')}
          ${target('13.a', 'Climate finance', 'Improving, not enough', 'mid')}
        </div>
        <p class="note">Photos on the right: click any photo to enlarge it. Next: what does this mean for Uzbekistan? →</p>`
    },
    {
      key: 'uzbekistan', num: 2, short: 'Uzbekistan', title: 'Uzbekistan’s Context',
      tabs: [['Heat', '🌡️'], ['Water', '💧'], ['Air & dust', '🌫️'], ['Awareness gap', '🧠'], ['Response', '🇺🇿']],
      cfg: [
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['aral', 'heat'], photos: 'uz-heat', flag: '🇺🇿', layout: 'one' },
        { view: { lat: 42.5, lon: 62, dist: 2.4 }, highlight: ['Uzbekistan'], pins: ['aralwater'], photos: 'uz-water', flag: '🇺🇿', layout: 'two' },
        { view: { lat: 41.31, lon: 69.24, dist: 1.7 }, highlight: ['Uzbekistan'], pins: ['smog'], photos: 'uz-air', flag: '🇺🇿', layout: 'two' },
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'] },
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'] }
      ],
      render: i => [uzHeat, uzWater, uzAir, uzAwareness, uzResponse][i]()
    },
    {
      key: 'practices', num: 3, short: 'Best practices', title: 'Best Practices from Other Countries',
      tabs: [['Overview', '🌍'], ['Green Riyadh', '🇸🇦'], ['UN ActNow', '🇺🇳'], ['Lessons', '💡']],
      cfg: [
        { view: { lat: 33, lon: 58, dist: 3.3 }, highlight: ['Saudi Arabia', 'Uzbekistan'], pins: ['riyadh', 'tashkent'], badge: true },
        { view: { lat: 24.7, lon: 46.7, dist: 1.9 }, highlight: ['Saudi Arabia'], pins: ['riyadh'], photos: 'riyadh', flag: '🇸🇦' },
        { view: { lat: 38, lon: 108, dist: 3.7 }, highlight: ['South Korea'], pins: ['seoul', 'tashkent'], photos: 'un', flag: '🇺🇳' },
        { view: { lat: 33, lon: 58, dist: 3.3 }, highlight: ['Saudi Arabia', 'Uzbekistan'], pins: ['riyadh', 'tashkent'] }
      ],
      render: i => [benchOverview, benchRiyadh, benchActNow, benchLessons][i]()
    },
    {
      key: 'adaptation', num: 4, short: 'Adaptation', title: 'Adaptation to Uzbekistan',
      tabs: [['Adapt the principle', '🌳'], ['Yashil AI', '🤖'], ['Can it work?', '⚖️'], ['Our role', '🎓'], ['ActNow → UZ', '👥'], ['One system', '🔗']],
      cfg: [
        { view: { lat: 34, lon: 58, dist: 3.1 }, highlight: ['Saudi Arabia', 'Uzbekistan'], pins: ['riyadh', 'tashkent'], photos: 'uz-riyadh', flag: '🇺🇿' },
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'] },
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'] },
        { view: TASHKENT_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'] },
        { view: UZ_VIEW, highlight: ['Uzbekistan'], pins: ['tashkent'], photos: 'uz-actnow', flag: '🇺🇿' },
        { view: { lat: 41.3, lon: 69.25, dist: 1.6 }, highlight: ['Uzbekistan'], pins: ['tashkent'] }
      ],
      render: i => [adaptPrinciple, adaptYashilAI, adaptCanItWork, adaptOurRole, adaptActNow, adaptSystem][i]()
    },
    {
      key: 'project', num: 5, short: 'Project', title: 'Our Project: EcoPulse',
      view: { lat: 41.3, lon: 69.25, dist: 1.14 }, highlight: ['Uzbekistan'], stage: true,
      render: () => projectPage()
    },
    {
      key: 'thanks', thanks: true, short: 'Thank you', title: 'Thank you',
      view: { lat: 30, lon: 64, dist: 4.4 }
    }
  ];
  const IDX = key => CHAPTERS.findIndex(c => c.key === key);

  /* ---------------- chapter 2: Uzbekistan ---------------- */

  function uzHeat() {
    return `
      ${tabs('uzbekistan', 0)}
      <div class="hero-q"><h3>The planet is warming.<br>Uzbekistan is feeling it faster.</h3></div>
      <div class="big-stat hot"><b>+1.6°C</b><span>rise in Uzbekistan’s average temperature over about 60 years, in a climate that is already hot and dry</span></div>
      <div class="kpis">
        ${kpi('up to +2.5°C', 'warming in the Aral Sea region')}
        ${kpi('+28.6', 'more hot days a year by 2040–2059*')}
        ${kpi('+31', 'more tropical nights a year by 2040–2059*')}
      </div>
      <div class="progress hot"><b>This summer:</b> 44.3°C in Tashkent on 19 July 2026, only 0.3°C below the city’s all-time record.</div>
      <p class="s-title">Why</p>
      <div class="chips"><span>Global warming</span><span>Hot, dry continental climate</span><span>Concrete, asphalt, few trees in cities</span><span>Longer, stronger hot periods</span></div>
      <p class="s-title">What it leads to</p>
      <div class="icons6">
        <div><span>❤️</span><b>Health</b><small>heatstroke, dehydration, heart strain</small></div>
        <div><span>🌾</span><b>Farming</b><small>crop stress, lower yields, more irrigation</small></div>
        <div><span>👷</span><b>Work</b><small>lower productivity outdoors</small></div>
        <div><span>⚡</span><b>Energy</b><small>more air conditioning</small></div>
        <div><span>🛣️</span><b>Roads &amp; buildings</b><small>damage, repair costs</small></div>
        <div><span>💧</span><b>Water</b><small>more evaporation, more demand</small></div>
      </div>
      <p class="src">*Projection under a high-emissions scenario (RCP 8.5). Sources: UNEP Atlas of Environmental Change for Uzbekistan (2025); Central Asia Climate Information Portal; Uzhydromet (July 2026)</p>`;
  }

  function uzWater() {
    return `
      ${tabs('uzbekistan', 1)}
      <div class="hero-q"><h3>Water: less of it, and more of it needed</h3></div>
      <div class="big-stat"><b>~80%</b><span>of Uzbekistan’s water comes from rivers that start outside the country (Amu Darya and Syr Darya)</span></div>
      <div class="kpis k4">
        ${kpi('−50%+', 'water per person since 1960')}
        ${kpi('−30–40%', 'projected drop in water available')}
        ${kpi('+25%', 'projected rise in irrigation demand')}
        ${kpi('−25–50%', 'river flow in extremely hot, dry years (regional)')}
      </div>
      <p class="s-title">Why</p>
      <div class="chips"><span>Glaciers are shrinking</span><span>Less reliable rain and snow</span><span>More evaporation in the heat</span><span>Farming uses most of the water</span><span>Shared rivers with neighbours</span><span>Old, leaky canals</span></div>
      <p class="s-title">What it leads to</p>
      <div class="icons6">
        <div><span>🌾</span><b>Farming</b><small>irrigation shortages, smaller harvests</small></div>
        <div><span>🍞</span><b>Food</b><small>less production, higher prices</small></div>
        <div><span>🏡</span><b>Villages</b><small>pressure on rural incomes</small></div>
        <div><span>🏭</span><b>Industry</b><small>higher costs, disruptions</small></div>
        <div><span>⚡</span><b>Energy</b><small>pressure on hydropower</small></div>
        <div><span>🤝</span><b>Neighbours</b><small>cooperation on rivers matters more</small></div>
      </div>
      <div class="lesson"><b>The bigger picture:</b> water is not just an environmental issue. It can limit farming, food security, industry and economic growth.</div>
      <p class="src">Sources: UNDP; OECD; World Bank climate and water assessments; UNEP Atlas (2025). The river-flow figure is a regional extreme-year estimate, not a forecast for every river.</p>`;
  }

  function uzAir() {
    return `
      ${tabs('uzbekistan', 2)}
      <div class="hero-q"><h3>Air pollution and dust storms</h3></div>
      <div class="big-stat hot"><b>6×</b><span>Tashkent’s yearly PM2.5 is more than six times the WHO guideline</span></div>
      <p class="s-title">Where Tashkent’s PM2.5 comes from</p>
      <div class="bars">
        <div><span>Windblown dust</span><i style="--w:36%"></i><b>36%</b></div>
        <div><span>Heating</span><i style="--w:28%"></i><b>28%</b></div>
        <div><span>Transport</span><i style="--w:16%"></i><b>16%</b></div>
        <div><span>Industry</span><i style="--w:13%"></i><b>13%</b></div>
      </div>
      <div class="callout">Two kinds of sources: <b>human</b> (heating, cars, industry) and <b>natural, climate-sensitive</b> (dust, sandstorms, dry degraded land). Climate change can make dust worse, but it is not the only cause.</div>
      <div class="kpis">
        ${kpi('0.7%', 'of national GDP: health costs of Tashkent’s PM2.5')}
        ${kpi('19th / 138', 'countries for PM2.5 exposure (UNECE 2026)')}
        ${kpi('−25%', 'total air-pollutant emissions, 2018–2024')}
      </div>
      <div class="chips"><span>Lung and heart disease</span><span>Children most at risk</span><span>Health costs, lost work</span><span>Damaged crops</span><span>Black carbon also warms the climate</span></div>
      <div class="lesson"><b>The bigger picture:</b> dust links air quality to drought and land degradation: less vegetation means more soil blowing in the wind.</div>
      <p class="src">Sources: World Bank, Air Quality Assessment for Tashkent; UNECE Environmental Performance Review (2026)</p>`;
  }

  function uzAwareness() {
    return `
      ${tabs('uzbekistan', 3)}
      <div class="hero-q"><h3>Uzbekistan does not have a “people don’t care” problem</h3>
        <p>It has an <b>awareness → knowledge → action</b> challenge.</p></div>
      <div class="gap-chain">
        <div class="ok"><b>CONCERN</b><span>high</span></div><i>→</i>
        <div class="mid"><b>KNOWLEDGE</b><span>uneven</span></div><i>→</i>
        <div class="bad"><b>ACTION</b><span>not yet routine</span></div>
      </div>
      <div class="evidence">
        <div><em>90%+</em><p><b>Concern is already high.</b> Over 90% of 109 young respondents were deeply or somewhat concerned about climate change; 79% said human activity contributes significantly.</p><small>UNDP-supported survey, 2022. Small, Tashkent-heavy sample, not nationally representative.</small></div>
        <div><em>44%</em><p><b>Deeper literacy is uneven.</b> 44% knew only one of the climate-policy terms tested (adaptation, mitigation, NDC, UNFCCC, Paris Agreement); nearly 54% outside Tashkent.</p><small>Same UNDP-supported survey, 2022.</small></div>
        <div><em>19.7%</em><p><b>Formal climate education is limited.</b> Among Uzbek respondents, only 19.7% named school or university as a place where they learned about climate change and disaster risks.</p><small>UNICEF / ETF youth poll, 2024. Exploratory, not nationally representative.</small></div>
      </div>
      <p class="level">Everyday example: Uzbekistan produces about 1.8 million tonnes of plastic waste a year and only 6.6% is processed. The government’s own inventory names low environmental awareness as one of the obstacles.</p>
      <div class="lesson"><b>The real gap:</b> people may care before they know how to act. Concern exists, but climate literacy and easy, repeated ways to act are still developing.</div>
      <p class="src">Sources: UNDP (2022); UNICEF / ETF (2024); Ministry of Ecology via gov.uz (Jan and Nov 2025)</p>`;
  }

  function uzResponse() {
    return `
      ${tabs('uzbekistan', 4)}
      <div class="verdict mid"><b>On track, lagging or progressing well?</b><span>Progressing on plans, policy, cleaner air and youth engagement. Lagging on heat resilience, water security and turning concern into everyday action.</span></div>
      <p class="s-title">And Uzbekistan has already recognised this</p>
      <ul class="timeline">
        <li><b>2019</b><span>Strategy for the Transition to a Green Economy 2019–2030</span></li>
        <li><b>2021</b><span>Updated NDC: cut greenhouse gas per unit of GDP by 35% by 2030 vs 2010; “Yashil Makon” national greening project</span></li>
        <li><b>2023</b><span>“Uzbekistan-2030” Strategy: 25 GW of renewables by 2030</span></li>
        <li><b>2024</b><span>Strategy for Engaging Youth on the Climate Agenda: youth in institutions, scheduled eco-events, climate and ecology education</span></li>
        <li><b>2025</b><span>NDC 3.0 names children and young people as participants in climate action. A climate-education initiative aims, by 2028, to reach 1.3M school students, train 50,000 teachers and give green skills to 4,000 rural teenagers</span></li>
      </ul>
      <div class="two-col">
        <div class="col good"><p class="s-title">Achievements</p><ul>
          <li>Air-pollutant emissions down 25% (2018–2024)</li>
          <li>Solar and wind generation roughly doubled in 2025</li>
          <li>200M+ saplings planted in 2025</li>
          <li>Youth officially part of the climate agenda</li>
        </ul></div>
        <div class="col bad"><p class="s-title">Gaps</p><ul>
          <li>Heat is rising faster than the global average</li>
          <li>~80% of water comes from abroad, and demand keeps growing</li>
          <li>Tashkent PM2.5 still 6× the WHO guideline</li>
          <li>Concern is not yet turning into continuous action</li>
        </ul></div>
      </div>
      <div class="lesson"><b>Two connected tasks:</b> heat, water stress and dust all call for greening that is climate-smart and saves water. The awareness gap calls for easier ways for people to act. Who has already tested these ideas? →</div>
      <p class="src">Sources: UNFCCC (Uzbekistan NDC 3.0, 2025); Government of Uzbekistan; UNECE (2026); World Bank; gov.uz</p>`;
  }

  /* ---------------- chapter 3: benchmarks ---------------- */

  function benchOverview() {
    return `
      ${tabs('practices', 0)}
      <div class="hero-q">
        <h3>The problem is global.<br>The response has to be local.</h3>
        <p>Uzbekistan is not the first place facing these challenges. What can we learn from places that have already tried to respond?</p>
      </div>
      <p class="s-title">Two problems. Two proven approaches.</p>
      <div class="pairs">
        <div class="pair"><span class="pi">🔥</span><div class="pp"><b>HEAT</b><small>Hot cities, little water</small></div><span class="ar">→</span><div class="pp sol"><b>Climate-resilient greening</b><small>🇸🇦 Green Riyadh</small></div></div>
        <div class="pair"><span class="pi">👥</span><div class="pp"><b>AWARENESS</b><small>How we consume, travel, use energy and handle waste</small></div><span class="ar">→</span><div class="pp sol"><b>Citizen participation</b><small>🇺🇳 UN ActNow, proven nationally in 🇰🇷 South Korea</small></div></div>
      </div>
      <div class="lesson"><b>Our thesis:</b> the international lesson is twofold: make our cities more climate-resilient, and make climate action easier for citizens to take part in.</div>
      <p class="note">Why these benchmarks: each one answers one of the two problems in Uzbekistan’s context, each has real progress behind it, and each country is at or ahead of Uzbekistan’s development level.</p>`;
  }

  function benchRiyadh() {
    return `
      ${tabs('practices', 1)}
      <div class="practice-head">
        <span class="p-flag">🇸🇦</span>
        <div><h3>Riyadh: how do you green a hot, water-scarce city?</h3><p>Green Riyadh programme · Saudi Arabia · launched 2019</p></div>
      </div>
      <p class="level"><b>Development level:</b> High income (ahead of Uzbekistan), but with the same hard limits: extreme heat and very little water.</p>
      <div class="kpis k4">
        ${kpi('7.5M', 'trees across the city by 2030')}
        ${kpi('99', 'species chosen to suit Riyadh’s environment')}
        ${kpi('11→100%', 'of irrigation from treated water (target)')}
        ${kpi('−1.5–2°C', 'city air temperature (programme target, not yet measured)')}
      </div>
      <div class="progress"><b>Already happening:</b> by October 2026, three major parks were more than 85% complete, with 585,000+ trees and shrubs planted.</div>
      <div class="formula">RIGHT TREE <i>+</i> RIGHT PLACE <i>+</i> RIGHT WATER</div>
      <p class="s-title">How it works</p>
      <div class="chain">
        <span>🔥 Heat</span><i>→</i><span>More green cover</span><i>→</i><span>Species suited to local conditions</span><i>→</i><span>Efficient, treated water</span><i>→</i><span>Shade, cooler streets</span><i>→</i><span>Monitor &amp; maintain</span>
      </div>
      <div class="two-col vs">
        <div class="col"><p class="s-title">🇸🇦 Riyadh</p><ul><li>Extreme heat</li><li>Limited water</li><li>Needs climate-compatible plants</li><li>Large urban greening programme</li></ul></div>
        <div class="col"><p class="s-title">🇺🇿 Uzbekistan</p><ul><li>Extreme heat is a major climate risk</li><li>Water scarcity and drought are major risks</li><li>So greening must fit climate, soil and water</li><li>Yashil Makon: huge planting programme</li></ul></div>
      </div>
      <div class="lesson"><b>Lesson for us:</b> the lesson is not the number of trees. In an arid climate, greening must be designed around local conditions. We should not copy Riyadh’s scale. We should adapt its principle.</div>
      <p class="src">Sources: Royal Commission for Riyadh City (RCRC), Green Riyadh programme page and Oct 2026 update; Vision 2030; World Bank Uzbekistan CCDR (2023)</p>`;
  }

  function benchActNow() {
    return `
      ${tabs('practices', 2)}
      <div class="practice-head">
        <span class="p-flag">🇺🇳</span>
        <div><h3>UN ActNow: how do you turn awareness into action?</h3><p>UN campaign since 2018 · app built with AWorld</p></div>
      </div>
      <p class="bridge">“But climate action isn’t only about what cities plant. It is also about what people do.”</p>
      <p class="level">Individual consumption and waste choices are part of a much larger emissions system, and people need practical ways to take part in reducing their impact.</p>
      <p class="s-title">How ActNow / AWorld works</p>
      <div class="loop">
        <div><b>KNOW</b><span>Learn about sustainability. Understand your footprint.</span></div><i>→</i>
        <div><b>ACT</b><span>Get suggested actions. Complete missions.</span></div><i>→</i>
        <div><b>TRACK</b><span>See your progress. Join a community.</span></div><i>→</i>
        <div><b>REWARD</b><span>Earn points. Receive rewards.</span></div>
      </div>
      <div class="chips"><span>Reduce, reuse, repair, recycle</span><span>Save energy</span><span>Lower-carbon transport</span><span>Less food waste</span><span>Sustainable choices</span><span>Community action</span></div>
      <div class="proof">
        <p class="s-title">🇰🇷 Does it work at country scale? South Korea</p>
        <p>South Korea built the same loop into national policy: <b>Carbon Neutral Points</b> (2022). People earn cash-like points for green choices such as e-receipts, reusable cups and refills. High income, ahead of Uzbekistan.</p>
        <div class="kpis">
          ${kpi('270k → 1.8M', 'participants, 2022 → 2024')}
          ${kpi('₩14.8bn', 'paid out in rewards in 2024 (₩2.45bn in 2022)')}
        </div>
      </div>
      <div class="lesson"><b>Lesson for us:</b> awareness turns into action when the action is easy, visible and rewarded.</div>
      <p class="src">Sources: UN ActNow (un.org/actnow); UN press release on the ActNow app (2020); AWorld; Korea Ministry of Environment via Korea.net (Dec 2024)</p>`;
  }

  function benchLessons() {
    return `
      ${tabs('practices', 3)}
      <div class="hero-q"><h3>What do both benchmarks teach us?</h3></div>
      <div class="split">
        <div><p class="s-title">🇸🇦 Green Riyadh</p><b>Climate data &amp; conditions</b><i>↓</i><b>Better physical action</b><em>Where? What? How?</em></div>
        <div><p class="s-title">🇺🇳 UN ActNow</p><b>Climate information</b><i>↓</i><b>Better citizen action</b><em>Know. Act. Track.</em></div>
      </div>
      <div class="formula">INFORMATION <i>→</i> DECISION <i>→</i> ACTION</div>
      <p class="s-title">Two levels of climate action</p>
      <div class="levels"><div>🏛️ <b>INSTITUTIONS</b></div><div>👥 <b>CITIZENS</b></div></div>
      <div class="lesson"><b>Conclusion:</b> information alone is not enough. Riyadh turns environmental conditions into targeted physical action. ActNow turns climate information into citizen participation. Effective climate action in Uzbekistan needs both.</div>
      <p class="note">Next: how we adapt both to Uzbekistan →</p>`;
  }

  /* ---------------- chapter 4: adaptation ---------------- */

  function adaptPrinciple() {
    return `
      ${tabs('adaptation', 0)}
      <div class="hero-q"><h3>Don’t copy Riyadh. Adapt the principle.</h3></div>
      <div class="four">
        <div>📍<b>RIGHT PLACE</b></div><div>🌳<b>RIGHT SPECIES</b></div><div>💧<b>RIGHT WATER</b></div><div>🛠️<b>LONG-TERM CARE</b></div>
      </div>
      <p class="s-title">What would this mean in Uzbekistan?</p>
      <p class="level">This principle fits Uzbekistan because our own greening programme has faced exactly these problems. In September 2026 the presidential review of Yashil Makon found:</p>
      <ul class="dots">
        <li>seedlings drying out</li>
        <li>species unsuited to local soil and climate</li>
        <li>planting where there was not enough water</li>
        <li>weak disease and pest control</li>
        <li>weak systematic care</li>
      </ul>
      <p class="level">The review moved attention to whether seedlings survive after <b>1, 3 and 5 years</b>, not how many are planted.</p>
      <div class="qswap">
        <div class="old"><small>OLD QUESTION</small><b>🌱 How many trees did we plant?</b></div>
        <i>↓</i>
        <div class="new"><small>BETTER QUESTION</small><b>🌳 Did we plant the right tree, and did it survive?</b></div>
      </div>
      <p class="src">Sources: RCRC (Green Riyadh); President.uz and Dunyo.info (Sept 2026)</p>`;
  }

  function adaptYashilAI() {
    return `
      ${tabs('adaptation', 1)}
      <div class="hero-q"><h3>Yashil AI: from data to better greening decisions</h3>
        <p>Presidential Decree PF-206 · 23 September 2026 · an experimental module, to be launched within six months</p></div>
      <div class="ai-flow">
        <div class="col-in"><p class="s-title">Inputs</p>
          <span>🌱 <b>Soil</b> land quality, soil type</span>
          <span>💧 <b>Water</b> water availability</span>
          <span>🌡️ <b>Climate</b> local conditions</span>
          <span>🛰️ <b>Satellite</b> remote sensing</span>
          <span>👁️ <b>Field</b> on-the-ground observations</span>
        </div>
        <div class="core"><i>→</i><b>YASHIL<br>AI</b><i>→</i></div>
        <div class="col-out"><p class="s-title">Decisions</p>
          <span>📍 <b>Where?</b> is greening suitable</span>
          <span>🌳 <b>What?</b> trees and shrubs fit here</span>
          <span>📐 <b>How much?</b> seedlings, planting pattern</span>
          <span>📅 <b>When?</b> to plant</span>
          <span>💧 <b>How?</b> to irrigate and maintain</span>
          <span>⚠️ <b>At risk?</b> water, drying, disease, pests</span>
        </div>
      </div>
      <p class="level">Data is kept on a unified map for fast monitoring, forecasts, public reports and open tracking of results.</p>
      <div class="levels eq"><div><b>YASHIL MAKON</b><small>the implementation system</small></div><i>+</i><div><b>YASHIL AI</b><small>the decision-support layer</small></div></div>
      <div class="lesson"><b>In one sentence:</b> Yashil AI is designed to move Uzbekistan from quantity-based planting to location-specific greening decisions: where to plant, what to plant, how to care for it and where risks are emerging.</div>
      <p class="note">It is not a “heat-map app”: heat is one input. The same decree also brings the 3-30-300 rule and swaps thirsty decorative lawns for drought-resistant planting, mulching and water-saving irrigation.</p>
      <p class="src">Source: Presidential Decree PF-206 (Lex.uz, Sept 2026)</p>`;
  }

  function adaptCanItWork() {
    return `
      ${tabs('adaptation', 2)}
      <div class="hero-q"><h3>Promising technology. Real implementation conditions.</h3></div>
      <div class="two-col eb">
        <div class="col good"><p class="s-title">Enablers</p><ul>
          <li><b>A strong mandate.</b> The decree assigns the Ministry of Digital Technologies, Ecology Committee, Cadastre Agency, Ministry of Water Resources and Hydromet: the very bodies that hold the data.</li>
          <li><b>A way to act already exists.</b> Yashil AI is built inside Yashil Makon, so its advice has national and mahalla-level users.</li>
          <li><b>Proven logic.</b> FAO and the World Bank say urban trees must match the site: climate, heat, soil, water, drought-resistant species, efficient irrigation.</li>
        </ul></div>
        <div class="col bad"><p class="s-title">Barriers</p><ul>
          <li><b>Data quality.</b> AI cannot fix unreliable inputs. Are datasets accurate, current, compatible and linked on a map?</li>
          <li><b>Prediction ≠ field reality.</b> Remote-sensing results need field validation.</li>
          <li><b>Recommendation ≠ implementation.</b> Seedling quality, planting, irrigation, protection and care still decide survival.</li>
          <li><b>Uzbekistan is not one environment.</b> Tashkent, Bukhara, Khorezm, Karakalpakstan and the mountains all differ.</li>
          <li><b>It is still a pilot.</b> No measured impact yet, so we evaluate its potential, not its results.</li>
        </ul></div>
      </div>
      <div class="quotes">
        <div>“The satellite sees the landscape. The field tells us what is actually happening.”</div>
        <div>“AI can recommend the tree. It cannot water it.”</div>
      </div>
      <p class="src">Sources: PF-206 (Lex.uz); FAO urban-forestry guidance and FAO review of AI in forest monitoring (2026); World Bank</p>`;
  }

  function adaptOurRole() {
    return `
      ${tabs('adaptation', 3)}
      <div class="hero-q"><h3>We are not only studying Yashil AI</h3></div>
      <div class="partners"><b>MINISTRY OF DIGITAL TECHNOLOGIES + IT PARK</b><i>↕</i><b>OUR SDG 13 TEAM</b></div>
      <p class="level">Our team is in contact with the Ministry of Digital Technologies and IT Park, and contributes to Yashil AI at student level.</p>
      <div class="role3">
        <div><span>✅</span><b>VALIDATE</b><small>Flagged site → student field visit → geotagged evidence → compare with the digital output → structured feedback. The technical team sets the method.</small></div>
        <div><span>🧪</span><b>TEST</b><small>Can ordinary users read the map, report an issue, understand advice and follow their report? We note where they struggle.</small></div>
        <div><span>🔎</span><b>RESEARCH</b><small>Short benchmarks and KPI design: short research → clear decision → practical recommendation.</small></div>
      </div>
      <p class="note">We are not AI engineers or forestry specialists. Our job is to connect the technical system with field reality and real users.</p>
      <p class="s-title">How will we know whether Yashil AI works?</p>
      <p class="struck">Number of trees planted</p>
      <div class="kpi-chain">
        <div><b>MODEL</b><small>Right sites? Correct risk alerts? Suitable species?</small></div><i>→</i>
        <div><b>IMPLEMENTATION</b><small>Advice followed? Irrigation available? Maintenance done?</small></div><i>→</i>
        <div><b>OUTCOMES</b><small>Survival, green cover, water use, shade, resilience</small></div>
      </div>
      <p class="note">A bad outcome does not prove “the AI failed”, and a good one does not prove “the AI did it”. We need evidence along the whole chain.</p>`;
  }

  function adaptBoxes(a) {
    return `
      <div class="adapt">
        <div class="a-box rel"><p class="s-title">Why it is relevant</p><p>${a.relevance}</p></div>
        <div class="a-box how"><p class="s-title">How to adapt it locally</p><ul>${a.adapt.map(d => `<li>${d}</li>`).join('')}</ul></div>
        <div class="a-box bar"><p class="s-title">Barriers</p><ul>${a.barriers.map(d => `<li>${d}</li>`).join('')}</ul></div>
        <div class="a-box en"><p class="s-title">Enabling factors</p><ul>${a.enablers.map(d => `<li>${d}</li>`).join('')}</ul></div>
      </div>`;
  }

  function adaptActNow() {
    return `
      ${tabs('adaptation', 4)}
      <div class="practice-head small">
        <span class="p-flag">🇺🇳</span><span class="arrow">→</span><span class="p-flag">🇺🇿</span>
        <div><h3>Know → Act → Track → Reward, the Uzbek way</h3><p>Citizen level · adapted from UN ActNow and Korea’s Carbon Neutral Points</p></div>
      </div>
      ${adaptBoxes({
        relevance: 'We saw the gap: over 90% of young respondents are concerned, yet 44% knew only one climate-policy term and only 19.7% learned about climate at school or university. Only 6.6% of plastic waste is processed. Concern exists; what is missing is an easy, repeated way to act. ActNow’s loop targets exactly that.',
        adapt: [
          '<b>Know:</b> simple, local facts about heat, water and air, on the phone people already use',
          '<b>Act:</b> easy local actions: water a tree near home, report a dried seedling, sort waste, refill instead of buying plastic',
          '<b>Track:</b> people see their own progress, and greening reports can feed the Yashil AI unified map, which already plans public reports',
          '<b>Reward:</b> volunteer hours for students, partner discounts, points for the mahalla green rating'
        ],
        barriers: [
          'Hashar is sometimes seen as mandatory, so this must stay voluntary to earn trust',
          'Someone has to pay for the rewards',
          'Fake check-ins: missions need photo or GPS proof',
          'Older and rural residents are less online'
        ],
        enablers: [
          'Youth strategy (2024) and NDC 3.0 already call for youth participation',
          'Climate-education initiative: 1.3M students by 2028',
          'The mahalla system reaches every household',
          'Korea shows it scales: 270k → 1.8M participants in 3 years'
        ]
      })}
      <p class="src">Sources: UNDP (2022); UNICEF / ETF (2024); gov.uz (Nov 2025); UNFCCC; Korea.net (Dec 2024)</p>`;
  }

  function adaptSystem() {
    return `
      ${tabs('adaptation', 5)}
      <div class="hero-q"><h3>Two levels, one system</h3><p>Each level makes the other one work.</p></div>
      <div class="cycle">
        <div class="c-step"><span>🏛️</span><b>Institutions decide</b><p>Yashil AI and the unified map suggest <em>where</em> to plant, <em>which</em> species and how to water them.</p></div>
        <i>↓</i>
        <div class="c-step"><span>👥</span><b>Citizens act</b><p>Students and mahallas plant, water and report through simple missions, and get rewarded.</p></div>
        <i>↓</i>
        <div class="c-step"><span>🎓</span><b>Field data comes back</b><p>Citizen reports and student validation show what really survived, so the next decisions get better.</p></div>
        <i class="back">↺ repeat</i>
      </div>
      <div class="formula">INFORMATION <i>→</i> DECISION <i>→</i> ACTION</div>
      <div class="lesson"><b>Technology improves decisions. People make them happen.</b> Our project builds the citizen side of this system →</div>`;
  }

  /* ---------------- chapter 5: our project (EcoPulse) ---------------- */

  const EP_SECTIONS = [
    { n: '01', tag: 'START', icon: '🏠', name: 'Home', head: 'Feel the pulse of our planet.',
      text: 'Our home. Our future. Our move. EcoPulse helps people understand Uzbekistan’s changing environment and turn everyday awareness into meaningful action.',
      facts: ['<b>Starting in Tashkent,</b> growing with Uzbekistan', '<b>Rooted in evidence</b>, powered by participation', 'Global goal 13, <b>local action</b>'],
      shot: 'img/ecopulse-home.jpg', url: 'Home', cap: 'EcoPulse home page' },
    { n: '02', tag: 'KNOW', icon: '📊', name: 'Environmental Pulse', head: 'Understand what is happening around you.',
      text: 'A clear, simple picture of Uzbekistan’s environment, so people know what is going on before they act.',
      points: ['Plain language, no jargon', 'Local, not abstract'] },
    { n: '03', tag: 'KNOW', icon: '📚', name: 'Learn', head: 'Learn something new.',
      text: 'Short, easy learning that turns concern into knowledge: exactly the awareness → knowledge gap we found.',
      points: ['Small steps, easy to finish', 'Builds climate literacy (SDG 13.3)'] },
    { n: '04', tag: 'ACT', icon: '📅', name: 'Take Action', head: 'Community activity calendar.',
      text: 'Discover ways to learn, care and connect. People find local activities in Tashkent and sign up in a few clicks.',
      facts: ['Activity types: <b>clean-ups</b>, <b>collection</b> (e.g. old batteries), <b>greening</b>', 'Search and filter by category, location and date', 'Proposed programme for <b>November–December 2026</b> (sample activities for now)'],
      shot: 'img/ecopulse-action.jpg', url: 'Take Action', cap: 'Take Action: community activity calendar' },
    { n: '05', tag: 'ACT', icon: '🛍️', name: 'Eco Market', head: 'Everyday essentials, the greener way.',
      text: 'A pilot collection of stationery, reusable bags and desk essentials for home, campus and work, so the green option is also the easy one.',
      facts: ['<b>Kraft barrel pen</b> · 2,000 UZS', '<b>Cotton market tote</b> · 15,000 UZS', '<b>Pocket kraft notebook</b> · 12,000 UZS', 'Example prices; selection inspired by the EcoSuvenir catalogue'],
      shot: 'img/ecopulse-market.jpg', url: 'Eco Market', cap: 'Eco Market: everyday essentials' },
    { n: '06', tag: 'TRACK', icon: '👤', name: 'My Profile', head: 'See your own progress.',
      text: 'A personal, local profile that shows what you have done over time, because what we can see, we keep doing.',
      points: ['Your local profile', 'Progress you can see'] }
  ];

  function projectPage() {
    return `
      <div class="ep">
        <header class="ep-hero">
          <p class="st-kicker">Chapter 5 · Our project</p>
          <h1>EcoPulse</h1>
          <p class="ep-tag">Know. <span>Act.</span> <em>Track.</em></p>
          <p class="st-sub">A student-led website that helps people in Uzbekistan understand their environment, explore local action and build better habits.</p>
          <div class="ep-loop"><b>KNOW</b><i>→</i><b>ACT</b><i>→</i><b>TRACK</b></div>
          <a class="ep-link" href="${ECOPULSE_URL}" target="_blank" rel="noopener">Open EcoPulse ↗</a>
        </header>
        ${EP_SECTIONS.map(x => `
        <section class="ep-sec${x.shot ? ' has-shot' : ''}">
          <div class="ep-side"><span class="ep-n">${x.n}</span><span class="ep-icon">${x.icon}</span><span class="ep-chip ${x.tag.toLowerCase()}">${x.tag}</span></div>
          <div class="ep-body">
            <p class="st-kicker">${x.name}</p>
            <h2>${x.head}</h2>
            <p>${x.text}</p>
            ${x.facts ? `<div class="ep-facts">${x.facts.map(t => `<div>${t}</div>`).join('')}</div>` : ''}
            ${x.points ? `<ul>${x.points.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
          </div>
          ${x.shot ? `<figure class="ep-shot"><div class="frame"><div class="bar"><i></i><i></i><i></i><span>EcoPulse · ${x.url}</span></div><img src="${x.shot}" alt="${x.cap}" loading="lazy"></div><figcaption>${x.cap} · click to enlarge</figcaption></figure>` : ''}
        </section>`).join('')}
        <section class="ep-sec ep-why">
          <div class="ep-body">
            <p class="st-kicker">Why EcoPulse</p>
            <h2>It follows from everything we showed</h2>
            <div class="ep-grid">
              <div><b>The problem</b><p>People in Uzbekistan care, but knowledge and easy ways to act are missing.</p></div>
              <div><b>The benchmark</b><p>UN ActNow and Korea showed that Know → Act → Track works when action is easy and visible.</p></div>
              <div><b>The adaptation</b><p>EcoPulse is the citizen side of the system: institutions decide, people act and track.</p></div>
            </div>
          </div>
        </section>
        <section class="ep-sec ep-smart">
          <div class="ep-body">
            <p class="st-kicker">Our SMART goal for the pilot</p>
            <h2>Pilot EcoPulse with university students in Tashkent</h2>
            <div class="st-right">${[
              ['S', 'Specific', 'Students use EcoPulse to learn, take local actions and track their progress'],
              ['M', 'Measurable', '500 registered students, 2,000 completed actions, before/after awareness survey'],
              ['A', 'Achievable', 'The website is already built; we run it through student clubs'],
              ['R', 'Relevant', 'Turns climate concern into action (SDG 13.3)'],
              ['T', 'Time-bound', 'Spring semester 2027 (February–May)']
            ].map(([l, n, t]) => `<div class="st-row"><i>${l}</i><div><b>${n}</b><p>${t}</p></div></div>`).join('')}</div>
          </div>
        </section>
        <div class="ep-end"><p>Know. Act. Track.</p><span>Next: thank you →</span></div>
      </div>`;
  }

  /* auto-scroll for the project page */
  let autoOn = false, autoRaf = 0, autoLast = 0, autoAcc = 0, autoTimer = 0;
  const AUTO_SPEED = 30; // pixels per second
  function autoBtn() { const b = document.querySelector('[data-nav="auto"]'); if (b) b.textContent = autoOn ? '⏸ Pause scroll' : '▶ Auto-scroll'; }
  function startAuto() { autoOn = true; autoLast = 0; autoAcc = 0; cancelAnimationFrame(autoRaf); autoRaf = requestAnimationFrame(autoTick); autoBtn(); }
  function stopAuto() { autoOn = false; clearTimeout(autoTimer); cancelAnimationFrame(autoRaf); autoBtn(); }
  function autoTick(t) {
    if (!autoOn) return;
    if (!autoLast) autoLast = t;
    autoAcc += AUTO_SPEED * Math.min(0.25, (t - autoLast) / 1000); autoLast = t;
    const px = Math.floor(autoAcc);
    if (px) { stageEl.scrollTop += px; autoAcc -= px; }
    if (stageEl.scrollTop + stageEl.clientHeight >= stageEl.scrollHeight - 2) return stopAuto();
    autoRaf = requestAnimationFrame(autoTick);
  }

  /* ---------------- thank you + QR codes ---------------- */
  function qrSvg(text) {
    const qr = new QRCode(-1, QRCode.M); qr.addData(text); qr.make();
    const n = qr.getModuleCount(), q = 4; let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n + q * 2} ${n + q * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#02040a"/></svg>`;
  }
  let qrDone = false;
  function buildThanks() {
    if (qrDone || !window.QRCode) return;
    document.getElementById('qr-eco').innerHTML = qrSvg(ECOPULSE_URL);
    qrDone = true;
  }

  /* ---------------- photos ----------------
     Each slot tries, in order: a local file (photos/<file> or photos/<key>-<n>.jpg), then the lead photo of a
     Wikipedia article (wiki), then a Wikimedia Commons photo search (q). See photos/README.txt. */
  const PHOTOS = {
    global: [
      { cap: '2024: the hottest year on record', credit: 'Temperature change vs 1951–1980 · NASA GISS', local: true },
      { cap: 'Central Tuyuksu glacier, Kazakhstan: 1958 → 2016', credit: 'Glacier outlines on satellite image', local: true },
      { cap: 'Aral Sea: March 2016 vs March 2024', credit: 'Copernicus Sentinel-2 (EU)', local: true },
      { cap: 'Drought: cracked farmland', local: true },
      { cap: 'Alpine glacier: 1935 vs 2022', local: true },
      { cap: 'Extreme rainfall and flooding', local: true }
    ],
    'uz-heat': [{ cap: 'Extreme heat: 44.3°C in Tashkent', file: 'uz-temperatures.jpg', local: true }],
    'uz-water': [
      { cap: 'A dry irrigation canal', credit: 'Photo: Kun.uz', file: 'uz-dry-canal.jpg', local: true },
      { cap: 'Aral Sea: ships left on dry land', file: 'uz-aral-ships.jpg', local: true }
    ],
    'uz-air': [
      { cap: 'Smog over Tashkent traffic', file: 'uz-smog.jpg', local: true },
      { cap: 'Dust and smoke over the city', file: 'uz-smog-tower.jpg', local: true }
    ],
    riyadh: [
      { cap: 'Riyadh in a dust storm: heat and dust', local: true },
      { cap: 'Drought: water is the hard limit', local: true },
      { cap: 'Green Riyadh: greening the desert city', q: ['Wadi Hanifa Riyadh', 'King Abdullah Park Riyadh', 'Riyadh park trees'], wiki: ['Riyadh'] }
    ],
    un: [
      { cap: 'UN Climate Change Conference, COP28', q: ['COP28 Expo City Dubai venue', 'COP28 Blue Zone Dubai'], wiki: ['Expo City Dubai'] },
      { cap: 'United Nations Headquarters, New York', wiki: ['Headquarters of the United Nations'], q: ['United Nations Headquarters New York'] },
      { cap: 'ActNow: citizens taking climate action', q: ['tree planting volunteers', 'beach cleanup volunteers', 'litter picking volunteers'] }
    ],
    'uz-riyadh': [
      { cap: 'Dry land: the Aral Sea’s lost shoreline', file: 'uz-aral-ships.jpg', local: true },
      { cap: 'Tashkent: a growing city that needs shade', wiki: ['Tashkent'], q: ['Tashkent park trees'] },
      { cap: 'Saxaul: a drought-tolerant native tree', q: ['saxaul Haloxylon', 'saxaul Aral'], wiki: ['Haloxylon ammodendron'] }
    ],
    'uz-actnow': [
      { cap: 'Mahalla life in Uzbekistan', q: ['mahalla Uzbekistan', 'Tashkent old town mahalla'], wiki: ['Mahalla'] },
      { cap: 'Lower-carbon transport: Tashkent Metro', wiki: ['Tashkent Metro'], q: ['Tashkent Metro station'] },
      { cap: 'Students: our generation', wiki: ['Westminster International University in Tashkent'], q: ['Tashkent university students'] }
    ]
  };

  const remoteCache = new Map();
  function cached(key, fn) { if (!remoteCache.has(key)) remoteCache.set(key, fn()); return remoteCache.get(key); }
  async function getJSON(url) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 7000);
    try { const r = await fetch(url, { signal: ctl.signal }); return r.ok ? await r.json() : null; }
    catch (e) { return null; } finally { clearTimeout(to); }
  }
  function wikiPhoto(title) {
    return cached('w:' + title, async () => {
      const d = await getJSON('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_')));
      const th = d && d.thumbnail && d.thumbnail.source;
      if (!th || /\.svg/i.test(th) || /logo/i.test(th)) return null;
      return { url: th.replace(/\/(\d+)px-/, '/960px-'), fallback: th };
    });
  }
  function commonsPhoto(query) {
    return cached('c:' + query, async () => {
      const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=12' +
        '&gsrsearch=' + encodeURIComponent(query + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=960';
      const d = await getJSON(u);
      const pages = d && d.query && d.query.pages ? Object.values(d.query.pages) : [];
      pages.sort((a, b) => a.index - b.index);
      for (const p of pages) {
        const ii = p.imageinfo && p.imageinfo[0];
        if (!ii || ii.mime !== 'image/jpeg' || ii.width < 800 || ii.width < ii.height * 1.15) continue;
        if (/logo|map|flag|diagram|chart/i.test(p.title)) continue;
        return { url: ii.thumburl || ii.url, fallback: ii.url };
      }
      return null;
    });
  }
  async function remotePhoto(slot) {
    for (const t of slot.wiki || []) { const r = await wikiPhoto(t); if (r) return r; }
    for (const q of slot.q || []) { const r = await commonsPhoto(q); if (r) return r; }
    return null;
  }

  const photosEl = document.getElementById('photos');
  let photoToken = 0;
  function showPhotos(key, flag, layout) {
    const list = PHOTOS[key];
    const token = ++photoToken;
    if (!list) { hidePhotos(); return; }
    photosEl.className = 'photos' + (layout ? ' ' + layout : '');
    document.body.classList.toggle('photos-six', layout === 'six');
    photosEl.innerHTML = list.map((ph, n) => `
      <figure class="ph loading" data-n="${n}" title="Click to enlarge">
        <img alt="${ph.cap}" decoding="async">
        <div class="ph-ph"><span>${flag || '🌍'}</span><b>${ph.cap}</b></div>
        <figcaption><b>${ph.cap}</b><span>${ph.local ? (ph.credit || '') : 'Photo: Wikimedia Commons'}</span></figcaption>
      </figure>`).join('');
    document.body.classList.add('photos-on');
    list.forEach((ph, n) => {
      const fig = photosEl.children[n], img = fig.querySelector('img');
      const done = () => { if (token === photoToken) { fig.classList.remove('loading'); fig.classList.add('ok'); } };
      const fail = () => { if (token === photoToken) fig.classList.remove('loading'); };
      const useRemote = async () => {
        const r = await remotePhoto(ph);
        if (token !== photoToken) return;
        if (!r) return fail();
        img.onload = done;
        img.onerror = () => { img.onerror = fail; img.src = r.fallback; };
        img.src = r.url;
      };
      img.onload = done;
      img.onerror = () => { img.onerror = null; useRemote(); };
      img.src = 'photos/' + (ph.file || `${key}-${n + 1}.jpg`);
    });
  }
  function hidePhotos() { photoToken++; document.body.classList.remove('photos-on', 'photos-six'); }

  /* click a photo to see it full screen */
  const lightbox = document.getElementById('lightbox');
  function openLightbox(fig) {
    const img = fig.querySelector('img');
    if (!fig.classList.contains('ok') || !img.src) return;
    lightbox.querySelector('img').src = img.src;
    lightbox.querySelector('figcaption').innerHTML = fig.querySelector('figcaption').innerHTML;
    document.body.classList.add('lightbox-on');
  }
  function closeLightbox() { document.body.classList.remove('lightbox-on'); }
  photosEl.addEventListener('click', e => { const f = e.target.closest('.ph'); if (f) openLightbox(f); });
  lightbox.addEventListener('click', closeLightbox);

  /* ---------------- pins on the globe ---------------- */

  const pinLayer = document.getElementById('labels');
  const badge = document.createElement('div');
  badge.className = 'un-badge glass';
  badge.innerHTML = '<div>🇺🇳 <b>UN ActNow</b> · Global</div><span>awareness → citizen action</span>';
  document.body.appendChild(badge);
  let pins = [], pinLoop = 0;
  function setPins(keys, showBadge) {
    pins.forEach(p => p.el.remove());
    pins = (keys || []).map(k => {
      const P = PIN[k], el = document.createElement('div');
      el.className = 'chap-pin' + (P.hot ? ' hot' : ''); el.innerHTML = `<i></i><span>${P.html}</span>`; el.style.opacity = 0;
      pinLayer.appendChild(el);
      return { el, pos: Globe.latLonToVec3(P.lat, P.lon, 1.004), normal: Globe.latLonToVec3(P.lat, P.lon, 1) };
    });
    document.body.classList.toggle('badge-on', !!showBadge);
    cancelAnimationFrame(pinLoop);
    if (pins.length) pinLoop = requestAnimationFrame(tickPins);
  }
  function tickPins() {
    // flip a label to the left of its dot when it would run under the photo column / off screen
    const limit = document.body.classList.contains('photos-on') ? photosEl.getBoundingClientRect().left - 8 : window.innerWidth - 8;
    for (const p of pins) {
      const f = Globe.facing(p.normal);
      const s = Globe.screenOf(p.pos);
      p.el.style.opacity = Math.max(0, Math.min(1, (f - 0.15) / 0.1)).toFixed(2);
      p.el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
      if (!p.w) p.w = p.el.querySelector('span').offsetWidth;
      p.el.classList.toggle('flip', s.x + 14 + p.w > limit);
    }
    pinLoop = requestAnimationFrame(tickPins);
  }

  /* ---------------- chapter 5 stage (no globe) ---------------- */

  function stageNav() {
    return `<div class="st-nav">
      <button data-nav="prev">← Back</button>
      <button data-nav="auto">⏸ Pause scroll</button>
      <button data-nav="next" class="primary">Thank you →</button>
    </div>`;
  }

  /* ---------------- small render helpers ---------------- */

  function trend(kind, label, value, text, src) {
    const arrow = kind === 'gap' ? '⚠' : '▲';
    return `<div class="trend ${kind}"><div class="t-top"><span class="t-arrow">${arrow}</span><span class="t-label">${label}</span></div>
      <span class="t-val">${value}</span><p>${text}</p><span class="src">${src}</span></div>`;
  }
  const target = (n, label, status, cls) => `<div class="target ${cls}"><b>${n}</b><span>${label}</span><i>${status}</i></div>`;
  const kpi = (v, l) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`;
  function tabs(key, i) {
    return `<div class="sub-tabs">${CHAPTERS[IDX(key)].tabs.map(([label, icon], k) =>
      `<button data-step="${k}" class="${k === i ? 'on' : ''}">${icon} ${label}</button>`).join('')}</div>`;
  }

  /* ---------------- chapter engine ---------------- */

  const bar = document.getElementById('chapter-bar');
  const slide = document.getElementById('slide');
  const body = document.getElementById('slide-body');
  const introEl = document.getElementById('intro');
  let current = -1, step = 0, introTimer = 0;

  bar.innerHTML = `<button data-ch="-1" class="explore">Explore</button>` +
    CHAPTERS.map((c, i) => `<button data-ch="${i}" class="${c.intro ? 'intro-btn' : ''}">${c.num ? `<span class="n">${c.num}</span>` : ''}<span class="l">${c.short}</span></button>`).join('');

  function stepsOf(c) { return c.cfg ? c.cfg.length : 1; }

  function slideWidth() { return slide.getBoundingClientRect().width || 560; }

  const stageEl = document.getElementById('stage');
  const wipeEl = document.getElementById('cloudwipe');
  let diveTimers = [];
  function clearDive() { diveTimers.forEach(clearTimeout); diveTimers = []; }
  function leaveStage() {
    clearDive(); stopAuto();
    document.body.classList.remove('stage-mode', 'stage-live');
    wipeEl.classList.remove('go');
  }
  function shiftGlobe() {
    if (window.innerWidth <= 760 || document.body.classList.contains('stage-mode') || document.body.classList.contains('intro-on') || document.body.classList.contains('thanks-on')) return Globe.setPanelShift(0);
    const sw = slideWidth() / 2 + 10;
    const pw = document.body.classList.contains('photos-on') ? photosEl.getBoundingClientRect().width / 2 + 10 : 0;
    Globe.setPanelShift(-sw + pw);
  }

  // intro: the title sits over a far-away Earth; leaving it zooms through the title towards the planet
  function showIntro() {
    clearTimeout(introTimer);
    document.body.classList.remove('intro-leaving');
    introEl.classList.remove('restart'); void introEl.offsetWidth; introEl.classList.add('restart');
    document.body.classList.add('intro-on');
  }
  function leaveIntro() {
    if (!document.body.classList.contains('intro-on')) return false;
    document.body.classList.remove('intro-on');
    document.body.classList.add('intro-leaving');
    clearTimeout(introTimer);
    introTimer = setTimeout(() => { document.body.classList.remove('intro-leaving'); requestAnimationFrame(shiftGlobe); }, 1500);
    return true;
  }

  function open(i, s = 0) {
    if (i < 0) return close();
    const firstOpen = current < 0;
    const c = CHAPTERS[i];
    const wasStage = document.body.classList.contains('stage-mode');
    current = i; step = s;
    closeLightbox();
    if (window.App) window.App.stopTour();
    Globe.chapterMode = true;
    document.body.classList.add('chapter');
    bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.ch === i));

    if (!c.thanks) document.body.classList.remove('thanks-on');
    if (c.thanks) {
      if (wasStage) leaveStage();
      leaveIntro();
      hidePhotos(); setPins([]);
      Globe.highlight([], GREEN);
      Globe.setPanelShift(0);
      Globe.flyTo({ lat: c.view.lat, lon: c.view.lon, zoom: c.view.dist }, { pin: false, duration: 2.2 });
      buildThanks();
      const th = document.getElementById('thanks');
      th.classList.remove('restart'); void th.offsetWidth; th.classList.add('restart');
      document.body.classList.add('thanks-on');
      return;
    }
    if (c.intro) {
      if (wasStage) leaveStage();
      hidePhotos(); setPins([]);
      Globe.highlight([], GREEN);
      Globe.setPanelShift(0);
      Globe.flyTo({ lat: c.view.lat, lon: c.view.lon, zoom: c.view.dist }, { pin: false, duration: 1.6 });
      showIntro();
      return;
    }
    const fromIntro = leaveIntro();

    // chapter 5: dive through the clouds into Uzbekistan, then show the full-screen recommendations (no globe)
    if (c.stage) {
      hidePhotos(); setPins([]);
      stageEl.innerHTML = c.render(step) + stageNav();
      stageEl.scrollTop = 0;
      stageEl.classList.remove('swap'); void stageEl.offsetWidth; stageEl.classList.add('swap');
      if (!wasStage) {
        document.body.classList.add('stage-mode');
        document.getElementById('slide-num').textContent = c.num;
        document.getElementById('slide-title').textContent = c.title;
        Globe.highlight(c.highlight, GREEN);
        Globe.setPanelShift(0);
        Globe.flyTo({ lat: c.view.lat, lon: c.view.lon, zoom: c.view.dist }, { pin: false, duration: 2.6 });
        diveTimers.push(setTimeout(() => wipeEl.classList.add('go'), 1900));
        diveTimers.push(setTimeout(() => document.body.classList.add('stage-live'), 2500));
        diveTimers.push(setTimeout(() => wipeEl.classList.remove('go'), 4000));
      }
      stopAuto();
      autoTimer = setTimeout(startAuto, wasStage ? 800 : 4200);
      autoBtn();
      return;
    }
    if (wasStage) leaveStage();

    document.getElementById('slide-num').textContent = c.num;
    document.getElementById('slide-title').textContent = c.title;
    body.innerHTML = c.render(step);
    body.scrollTop = 0;
    slide.classList.remove('swap'); void slide.offsetWidth; slide.classList.add('swap');
    document.getElementById('slide-pos').textContent = stepsOf(c) > 1 ? `${step + 1} / ${stepsOf(c)}` : '';

    // per-step settings or chapter-wide settings
    const k = c.cfg ? c.cfg[step] : { view: c.view, highlight: c.highlight };
    if (k.photos) showPhotos(k.photos, k.flag, k.layout); else hidePhotos();
    setPins(k.pins, k.badge);
    if (k.view) Globe.flyTo({ lat: k.view.lat, lon: k.view.lon, zoom: k.view.dist }, { pin: false, duration: fromIntro ? 2.4 : undefined });
    Globe.highlight(k.highlight || [], GREEN);
    requestAnimationFrame(shiftGlobe);
    if (firstOpen) slide.scrollTop = 0;
  }

  function close() {
    current = -1;
    leaveStage();
    hidePhotos();
    setPins([]);
    closeLightbox();
    clearTimeout(introTimer);
    document.body.classList.remove('intro-on', 'intro-leaving', 'thanks-on');
    Globe.chapterMode = false;
    Globe.highlight([], GREEN);
    Globe.setPanelShift(0);
    Globe.goHome();
    document.body.classList.remove('chapter');
    bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.ch === -1));
  }

  function next() {
    if (current < 0) return open(0);
    if (step < stepsOf(CHAPTERS[current]) - 1) return open(current, step + 1);
    if (current < CHAPTERS.length - 1) open(current + 1);
  }
  function prev() {
    if (current < 0) return;
    if (step > 0) return open(current, step - 1);
    if (current > 0) { const c = current - 1; open(c, stepsOf(CHAPTERS[c]) - 1); }
  }

  bar.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) open(+b.dataset.ch); });
  document.getElementById('slide-prev').addEventListener('click', prev);
  document.getElementById('slide-next').addEventListener('click', next);
  document.getElementById('slide-close').addEventListener('click', close);
  introEl.querySelector('[data-intro-start]').addEventListener('click', next);

  stageEl.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.step !== undefined) open(current, +t.dataset.step);
    else if (t.dataset.nav === 'next') next();
    else if (t.dataset.nav === 'prev') prev();
    else if (t.dataset.nav === 'auto') { if (autoOn) stopAuto(); else startAuto(); }
  });
  // click a screenshot on the project page to enlarge it
  stageEl.addEventListener('click', e => {
    const img = e.target.closest('.ep-shot img');
    if (!img) return;
    stopAuto();
    lightbox.querySelector('img').src = img.src;
    lightbox.querySelector('figcaption').innerHTML = `<b>${img.alt}</b><span>EcoPulse</span>`;
    document.body.classList.add('lightbox-on');
  });
  // any manual scrolling on the project page pauses the auto-scroll
  ['wheel', 'touchstart', 'mousedown'].forEach(ev => stageEl.addEventListener(ev, e => { if (!e.target.closest('.st-nav') && autoOn) stopAuto(); }, { passive: true }));
  document.getElementById('thanks').querySelector('[data-thanks-explore]').addEventListener('click', close);

  body.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (t && t.dataset.step !== undefined) open(current, +t.dataset.step);
  });

  // Runs before the explore-mode shortcuts in app.js and takes over the arrows while a chapter is open
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.body.classList.contains('lightbox-on')) { closeLightbox(); e.preventDefault(); e.stopImmediatePropagation(); return; }
    const byNum = /^[1-9]$/.test(e.key) ? CHAPTERS.findIndex(c => c.num === +e.key) : -1;
    if (byNum >= 0) { open(byNum); e.stopImmediatePropagation(); return; }
    if (e.key === 'i' || e.key === 'I' || e.key === 'Home') { open(IDX('intro')); e.stopImmediatePropagation(); return; }
    if (e.key === '0') { close(); e.stopImmediatePropagation(); return; }
    if (current < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === 'Enter' && CHAPTERS[current].intro)) next();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    else if (e.key === 'Escape') close();
    else if (e.key === ' ') { e.preventDefault(); if (CHAPTERS[current].key === 'project') { if (autoOn) stopAuto(); else startAuto(); } }
    else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && CHAPTERS[current].stage) { stopAuto(); return; }
    else return;
    e.stopImmediatePropagation();
  }, true);

  window.addEventListener('resize', () => { if (current >= 0) shiftGlobe(); });

  // start on the intro title once the Earth has loaded
  (function startWhenReady() {
    const loader = document.getElementById('loader');
    if (window.Globe && Globe.camera && loader.classList.contains('hide')) { if (current < 0) open(IDX('intro')); }
    else setTimeout(startWhenReady, 120);
  })();
})();
