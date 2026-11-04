/* Climate-impact data for each country hotspot.
   Every figure comes from a published source listed in `sources`.
   Order = order of the guided tour. */

window.HAZARDS = {
  heat:    { label: 'Extreme heat',        color: '#ff4b2b' },
  flood:   { label: 'Flooding',            color: '#3b9dff' },
  sea:     { label: 'Sea-level rise',      color: '#1fd6c4' },
  fire:    { label: 'Wildfires',           color: '#ff8c1a' },
  drought: { label: 'Drought',             color: '#f5c242' },
  storm:   { label: 'Cyclones & storms',   color: '#b583ff' },
  ice:     { label: 'Ice & glacier loss',  color: '#a5ecff' },
  air:     { label: 'Air pollution',       color: '#e86fb0' }
};

window.GLOBAL_STATS = {
  warming:   { value: '+1.55°C', label: '2024 vs pre-industrial — first year above 1.5°C', src: 'WMO, 2025' },
  sea:       { value: '+10 cm',  label: 'Global sea level since 1993',                     src: 'NASA' },
  arctic:    { value: '−12%',    label: 'Arctic summer sea ice, per decade',               src: 'NASA / NSIDC' },
  // live counters (per second)
  co2PerSec:    37.4e9 / 31557600,   // fossil CO2, 37.4 Gt in 2024 (Global Carbon Project)
  icePerSec:    (270e9 + 150e9) / 31557600, // Greenland 270 Gt/yr + Antarctica 150 Gt/yr (NASA GRACE)
  forestPerSec: 6.7e6 / 31557600     // ha of tropical primary forest lost, 2024 (Global Forest Watch)
};

window.COUNTRIES = [
  {
    id: 'uzbekistan', name: 'Uzbekistan', match: ['Uzbekistan'], flag: '🇺🇿', region: 'Central Asia',
    lat: 41.4, lon: 64.6, zoom: 1.75, hazard: 'air', risk: 'Very high',
    headline: 'Toxic air and a vanishing sea: Uzbekistan faces both pollution and climate change',
    stats: [
      { value: '6×', label: 'Tashkent’s fine-particle pollution (PM2.5) vs the WHO safe limit, 2024' },
      { value: '~27,000', label: 'early deaths a year in Uzbekistan from polluted air' }
    ],
    issues: [
      { group: 'Air pollution', type: 'air', title: 'Toxic winter smog', text: 'Tashkent’s average PM2.5 was 31.5 µg/m³ in 2024, more than 6 times the WHO limit of 5. In autumn and winter 2025 it repeatedly ranked among the most polluted cities in the world.' },
      { group: 'Air pollution', type: 'air', title: 'A deadly health risk', text: 'Fine particles get deep into the lungs and blood. The World Bank estimates about 27,000 early deaths a year nationwide, around 3,000 of them in Tashkent.' },
      { group: 'Air pollution', type: 'air', title: 'Where it comes from', text: 'In Tashkent, heating causes about 28% of human-made PM2.5, transport 16% and industry 13%. In summer, wind-blown dust makes up about 36%. Burning coal, gas and petrol also releases the CO₂ that drives climate change.' },
      { group: 'Air pollution', type: 'storm', title: 'Dust and salt storms', text: 'Hotter, drier weather and the dry Aral seabed send dust and toxic salt across the country. In November 2021 a huge dust storm turned Tashkent’s sky orange.' },
      { group: 'Climate impacts', type: 'heat', title: 'Warming fast', text: 'Uzbekistan’s average temperature has already risen about 1.6°C. May and June 2025 were among the hottest and driest on record, with up to 45°C in the Kyzylkum desert.' },
      { group: 'Climate impacts', type: 'drought', title: 'Water stress and drought', text: 'Almost the whole country faces water stress, and it is among the 20 most drought-prone countries. About 80% of its water comes from rivers that start abroad, and around 90% goes to farming.' },
      { group: 'Climate impacts', type: 'drought', title: 'Vanishing Aral Sea', text: 'Soviet-era irrigation drained the sea, once the world’s 4th-largest lake, which has lost about 90% of its area. Its dry bed is now the Aralkum, the world’s youngest desert.' },
      { group: 'Climate impacts', type: 'ice', title: 'Shrinking glaciers', text: 'Uzbekistan’s rivers start in the Tien Shan and Pamir mountains. Tien Shan glaciers lost about 27% of their mass between 1961 and 2012, so less water will reach the reservoirs.' },
      { group: 'Climate impacts', type: 'flood', title: 'Mudflows and floods', text: 'Heavy downpours trigger mudflows in the foothills of Jizzakh, Surkhandarya and the Fergana Valley. May 2026 was the warmest May on record and also brought historic rainfall and floods.' }
    ],
    action: 'A World Bank roadmap for cleaner air in Tashkent targets heating, transport and industry. The “Yashil Makon” (Green Space) programme plants trees nationwide, saxaul forests are being planted on the dry Aral seabed, and in 2021 the UN named the Aral Sea region a zone of environmental innovations.',
    sources: 'IQAir (2024–2025); World Bank Tashkent air quality assessment; Uzbekistan Ministry of Ecology, Environmental Protection and Climate Change; UNEP Central Asia climate atlas (2025); Uzhydromet; UNDP; FAO AQUASTAT; Farinotti et al., Nature Geoscience (2015); UN General Assembly resolution 75/278 (2021)'
  },
  {
    id: 'greenland', name: 'Greenland', match: ['Greenland'], flag: '🇬🇱', region: 'Arctic',
    lat: 72, lon: -40, zoom: 2.3, hazard: 'ice', risk: 'Extreme',
    headline: 'The ice sheet that could raise global seas by 7 metres',
    stat: { value: '270 bn t', label: 'of ice lost every year (2002–2023 average)' },
    issues: [
      { type: 'ice',   title: 'Melting ice sheet', text: 'Greenland loses about 270 billion tonnes of ice a year. If all of it melted, global sea level would rise about 7.4 m.' },
      { type: 'heat',  title: 'Rain on the summit', text: 'In August 2021 it rained at the 3,200 m summit for the first time ever recorded.' },
      { type: 'sea',   title: 'Global sea-level driver', text: 'Greenland meltwater is now one of the largest single contributors to global sea-level rise.' }
    ],
    action: 'Greenland’s government banned new oil and gas exploration in 2021, citing climate change.',
    sources: 'NASA GRACE/GRACE-FO; NSIDC; IPCC AR6'
  },
  {
    id: 'canada', name: 'Canada', match: ['Canada'], flag: '🇨🇦', region: 'North America',
    lat: 57, lon: -105, zoom: 2.4, hazard: 'fire', risk: 'High',
    headline: 'Warming about twice as fast as the global average',
    stat: { value: '18.4M ha', label: 'burned in the record 2023 wildfire season' },
    issues: [
      { type: 'fire', title: 'Record wildfires', text: 'The 2023 season burned ~18.4 million hectares — more than double the previous record — and forced 230,000+ people to evacuate.' },
      { type: 'heat', title: '2021 heat dome', text: 'Lytton, B.C. hit 49.6°C, Canada’s all-time record; the village burned down the next day. 619 people died from heat in B.C.' },
      { type: 'ice',  title: 'Arctic thaw', text: 'Northern Canada is warming about three times faster than the global average, thawing permafrost under roads and homes.' }
    ],
    action: 'Canada has committed in law to net-zero emissions by 2050 (Canadian Net-Zero Emissions Accountability Act, 2021).',
    sources: 'CIFFC; BC Coroners Service; Canada’s Changing Climate Report (2019)'
  },
  {
    id: 'usa', name: 'United States', match: ['United States of America'], flag: '🇺🇸', region: 'North America',
    lat: 38, lon: -98, zoom: 2.3, hazard: 'fire', risk: 'High',
    headline: 'Billion-dollar disasters are now routine',
    stat: { value: '28', label: 'separate billion-dollar weather disasters in 2023 — a record' },
    issues: [
      { type: 'fire',    title: 'Deadly wildfires', text: 'The 2023 Lahaina fire on Maui killed 102 people. In January 2025 Los Angeles fires destroyed ~16,000 structures.' },
      { type: 'storm',   title: 'Stronger hurricanes', text: 'Hurricane Helene (2024) killed about 250 people, with catastrophic flooding far inland in the Appalachians.' },
      { type: 'drought', title: 'Western megadrought', text: '2000–2021 was the driest 22-year period in the US Southwest in at least 1,200 years.' }
    ],
    action: 'The US is the largest historical emitter of CO₂ and currently emits about 13% of the global total.',
    sources: 'NOAA NCEI; Maui County; CAL FIRE; Williams et al., Nature Climate Change (2022); Global Carbon Project'
  },
  {
    id: 'mexico', name: 'Mexico', match: ['Mexico'], flag: '🇲🇽', region: 'North America',
    lat: 21, lon: -101, zoom: 1.9, hazard: 'storm', risk: 'High',
    headline: 'Storms that explode in strength overnight',
    stat: { value: '~24 h', label: 'for Hurricane Otis to go from tropical storm to Category 5 (2023)' },
    issues: [
      { type: 'storm',   title: 'Rapid intensification', text: 'Hurricane Otis strengthened faster than forecasts predicted and devastated Acapulco in October 2023.' },
      { type: 'drought', title: 'Water crisis', text: 'In 2024 Mexico City’s main reservoir system (Cutzamala) fell below 30% capacity, forcing water rationing.' },
      { type: 'heat',    title: 'Lethal heat', text: 'The 2024 heatwave killed over 150 people, and dozens of howler monkeys fell dead from trees in Tabasco.' }
    ],
    action: 'Mexico’s General Law on Climate Change (2012) was one of the first national climate laws in the developing world.',
    sources: 'US NHC; CONAGUA; Mexican Ministry of Health'
  },
  {
    id: 'honduras', name: 'Honduras', match: ['Honduras'], flag: '🇭🇳', region: 'Central America',
    lat: 14.8, lon: -86.8, zoom: 1.5, hazard: 'storm', risk: 'Very high',
    headline: 'In the “Dry Corridor” — hit by both drought and hurricanes',
    stat: { value: '2', label: 'Category 4 hurricanes (Eta and Iota) within two weeks in Nov 2020' },
    issues: [
      { type: 'storm',   title: 'Back-to-back hurricanes', text: 'Eta and Iota affected about 4 million people in Honduras, nearly 40% of the population.' },
      { type: 'drought', title: 'Dry Corridor crop failure', text: 'Repeated droughts destroy maize and bean harvests for subsistence farmers.' },
      { type: 'flood',   title: 'Climate migration', text: 'Crop losses and storm damage are major drivers of migration north towards the US.' }
    ],
    action: 'Central American countries are expanding early-warning systems and drought-resistant crops with WFP support.',
    sources: 'UN OCHA; WFP; World Bank'
  },
  {
    id: 'dominica', name: 'Dominica', match: ['Dominica'], flag: '🇩🇲', region: 'Caribbean',
    lat: 15.42, lon: -61.35, zoom: 1.35, hazard: 'storm', risk: 'Extreme',
    headline: 'One hurricane wiped out more than twice its economy',
    stat: { value: '226%', label: 'of GDP lost to Hurricane Maria in a single night (2017)' },
    issues: [
      { type: 'storm', title: 'Hurricane Maria', text: 'The Category 5 storm damaged or destroyed about 90% of buildings on the island.' },
      { type: 'sea',   title: 'Coastal exposure', text: 'Most people and infrastructure sit on a narrow coastal strip exposed to storm surge.' },
      { type: 'flood', title: 'Landslides', text: 'Extreme rainfall on steep volcanic slopes triggers deadly landslides.' }
    ],
    action: 'Dominica has pledged to become the world’s first “climate-resilient nation”.',
    sources: 'Government of Dominica Post-Disaster Needs Assessment (2017)'
  },
  {
    id: 'peru', name: 'Peru', match: ['Peru'], flag: '🇵🇪', region: 'South America',
    lat: -9.5, lon: -75, zoom: 1.9, hazard: 'ice', risk: 'High',
    headline: 'Home to most of the world’s tropical glaciers — and losing them',
    stat: { value: '56%', label: 'of glacier area lost between 1962 and 2020' },
    issues: [
      { type: 'ice',     title: 'Vanishing glaciers', text: 'Andean glaciers supply water to cities, farms and hydropower in the dry season.' },
      { type: 'drought', title: 'Water for Lima', text: 'Lima, a desert city of ~10 million, depends on rivers fed by glaciers and Andean rainfall.' },
      { type: 'flood',   title: 'El Niño floods', text: 'In 2023 Cyclone Yaku and coastal El Niño brought floods and Peru’s worst dengue outbreak on record.' }
    ],
    action: 'Peru passed a Framework Law on Climate Change in 2018.',
    sources: 'INAIGEM (2023); Peruvian Ministry of Health'
  },
  {
    id: 'brazil', name: 'Brazil', match: ['Brazil'], flag: '🇧🇷', region: 'South America',
    lat: -9, lon: -54, zoom: 2.2, hazard: 'drought', risk: 'High',
    headline: 'The Amazon rainforest is nearing a tipping point',
    stat: { value: '12.11 m', label: 'Rio Negro at Manaus — lowest level in 120+ years of records (2024)' },
    issues: [
      { type: 'drought', title: 'Amazon drought', text: 'Record droughts in 2023 and 2024 dried rivers, stranded communities and killed river dolphins.' },
      { type: 'fire',    title: 'Forest fires', text: 'Parts of the south-eastern Amazon now release more carbon than they absorb because of fires and deforestation.' },
      { type: 'flood',   title: 'Rio Grande do Sul floods', text: 'In 2024 floods affected 2.3 million people and killed over 180.' }
    ],
    action: 'Amazon deforestation fell by about half between 2022 and 2024; Brazil hosted COP30 in Belém in 2025.',
    sources: 'Port of Manaus; Gatti et al., Nature (2021); INPE; Rio Grande do Sul Civil Defense'
  },
  {
    id: 'chile', name: 'Chile', match: ['Chile'], flag: '🇨🇱', region: 'South America',
    lat: -33.5, lon: -71, zoom: 1.9, hazard: 'drought', risk: 'High',
    headline: 'A “megadrought” longer than any in a thousand years',
    stat: { value: '15+ yrs', label: 'of megadrought in central Chile since 2010' },
    issues: [
      { type: 'drought', title: 'Megadrought', text: 'Central Chile’s drought since 2010 is the longest in at least 1,000 years.' },
      { type: 'fire',    title: 'Deadliest fires', text: 'In February 2024 fires around Viña del Mar killed 137 people — the deadliest in Chile’s history.' },
      { type: 'ice',     title: 'Shrinking glaciers', text: 'Andean glaciers that feed Santiago’s water supply are retreating.' }
    ],
    action: 'Chile’s 2022 Climate Change Framework Law sets carbon neutrality by 2050.',
    sources: 'Garreaud et al., Int. J. Climatology (2020); SENAPRED'
  },
  {
    id: 'antarctica', name: 'Antarctica', match: ['Antarctica'], flag: '🇦🇶', region: 'Southern Ocean',
    lat: -78, lon: 20, zoom: 2.4, hazard: 'ice', risk: 'Extreme',
    headline: 'The largest reservoir of ice on Earth is starting to break',
    stat: { value: '150 bn t', label: 'of ice lost every year' },
    issues: [
      { type: 'ice', title: '“Doomsday” Glacier', text: 'Thwaites Glacier alone holds enough ice to raise sea level ~65 cm and is retreating fast.' },
      { type: 'ice', title: 'Record-low sea ice', text: 'In 2023 Antarctic winter sea ice was about 1 million km² below the previous record low.' },
      { type: 'sea', title: 'Global sea-level risk', text: 'The ice sheet holds enough water to raise global seas by about 58 m.' }
    ],
    action: 'The Antarctic Treaty (1959) protects the continent for science and peace.',
    sources: 'NASA GRACE; International Thwaites Glacier Collaboration; NSIDC; IPCC AR6'
  },
  {
    id: 'southafrica', name: 'South Africa', match: ['South Africa'], flag: '🇿🇦', region: 'Southern Africa',
    lat: -30, lon: 24, zoom: 1.9, hazard: 'drought', risk: 'High',
    headline: 'The city that almost ran out of water',
    stat: { value: '50 L', label: 'daily water limit per person in Cape Town during the 2018 “Day Zero” crisis' },
    issues: [
      { type: 'drought', title: 'Day Zero', text: 'In 2018 Cape Town’s dams fell to about 20% and taps were nearly switched off for 4 million people.' },
      { type: 'flood',   title: 'KwaZulu-Natal floods', text: 'In April 2022 floods around Durban killed over 400 people — climate change made the rain about twice as likely.' },
      { type: 'heat',    title: 'Rising heat', text: 'South Africa is warming about twice as fast as the global average.' }
    ],
    action: 'Cape Town cut water use by more than half through restrictions and conservation, avoiding Day Zero.',
    sources: 'City of Cape Town; World Weather Attribution (2022); South African Weather Service'
  },
  {
    id: 'mozambique', name: 'Mozambique', match: ['Mozambique'], flag: '🇲🇿', region: 'Southern Africa',
    lat: -18, lon: 35, zoom: 1.9, hazard: 'storm', risk: 'Very high',
    headline: 'In the path of the longest-lasting cyclone ever recorded',
    stat: { value: '36 days', label: 'Cyclone Freddy (2023) — the longest-lived tropical cyclone on record' },
    issues: [
      { type: 'storm', title: 'Cyclone Idai', text: 'In 2019 Idai killed more than 1,000 people across Mozambique, Malawi and Zimbabwe.' },
      { type: 'storm', title: 'Cyclone Freddy', text: 'Freddy crossed the Indian Ocean and hit Mozambique twice in 2023, killing over 1,000 across the region.' },
      { type: 'flood', title: 'Coastal flooding', text: 'Low-lying cities like Beira face storm surge and sea-level rise.' }
    ],
    action: 'Beira is building drainage and coastal protection with World Bank support after Idai.',
    sources: 'WMO (2024); UN OCHA'
  },
  {
    id: 'somalia', name: 'Somalia', match: ['Somalia', 'Somaliland'], flag: '🇸🇴', region: 'Horn of Africa',
    lat: 5, lon: 46, zoom: 1.9, hazard: 'drought', risk: 'Extreme',
    headline: 'Five failed rainy seasons in a row',
    stat: { value: '43,000', label: 'estimated excess deaths from drought in 2022 — half were children under 5' },
    issues: [
      { type: 'drought', title: 'Worst drought in 40 years', text: 'Five consecutive failed rainy seasons (2020–2023). Climate change made the drought about 100 times more likely.' },
      { type: 'flood',   title: 'Then floods', text: 'Late-2023 floods displaced more than 1.2 million people.' },
      { type: 'heat',    title: 'Food insecurity', text: 'Millions of livestock died, pushing families into hunger and displacement.' }
    ],
    action: 'Somalia’s first National Climate Change Policy aims to build drought and flood resilience.',
    sources: 'WHO/UNICEF/LSHTM (2023); World Weather Attribution (2023); UN OCHA'
  },
  {
    id: 'chad', name: 'Chad', match: ['Chad'], flag: '🇹🇩', region: 'Sahel',
    lat: 15, lon: 19, zoom: 2.0, hazard: 'drought', risk: 'Extreme',
    headline: 'Among the most climate-vulnerable countries in the world',
    stat: { value: '−90%', label: 'shrinkage of Lake Chad since the 1960s' },
    issues: [
      { type: 'drought', title: 'Shrinking Lake Chad', text: 'Drought and water use shrank the lake that supports ~30 million people across four countries.' },
      { type: 'heat',    title: 'Desertification', text: 'The Sahara is pushing south into farmland and grazing land.' },
      { type: 'flood',   title: 'Extreme floods', text: 'Floods in 2024 affected nearly 2 million people.' }
    ],
    action: 'Chad is part of Africa’s Great Green Wall — an effort to restore 100 million hectares of land across the Sahel.',
    sources: 'FAO; ND-GAIN Index; UN OCHA; UNCCD'
  },
  {
    id: 'nigeria', name: 'Nigeria', match: ['Nigeria'], flag: '🇳🇬', region: 'West Africa',
    lat: 9, lon: 8, zoom: 1.9, hazard: 'flood', risk: 'High',
    headline: 'Floods in the south, desert in the north',
    stat: { value: '1.4M', label: 'people displaced by the 2022 floods' },
    issues: [
      { type: 'flood',   title: '2022 floods', text: 'The worst floods in a decade killed over 600 people.' },
      { type: 'heat',    title: 'Desertification', text: 'Northern states are losing farmland to the advancing Sahara.' },
      { type: 'sea',     title: 'Lagos at risk', text: 'Lagos, one of Africa’s biggest cities, faces coastal erosion and flooding from sea-level rise.' }
    ],
    action: 'Nigeria’s Climate Change Act (2021) set a net-zero target for 2050–2070.',
    sources: 'Nigerian Ministry of Humanitarian Affairs; NEMA'
  },
  {
    id: 'libya', name: 'Libya', match: ['Libya'], flag: '🇱🇾', region: 'North Africa',
    lat: 32.7, lon: 22.6, zoom: 1.9, hazard: 'flood', risk: 'High',
    headline: 'A storm that broke two dams',
    stat: { value: '4,000+', label: 'killed when Storm Daniel burst dams above Derna (Sept 2023)' },
    issues: [
      { type: 'storm', title: 'Storm Daniel', text: 'A Mediterranean “medicane” dumped extreme rain, and climate change made it up to 50 times more likely.' },
      { type: 'flood', title: 'Derna disaster', text: 'Two ageing dams collapsed, sweeping entire neighbourhoods into the sea.' },
      { type: 'heat',  title: 'Water scarcity', text: 'One of the most water-scarce countries on Earth, relying on fossil groundwater.' }
    ],
    action: 'The disaster showed how weak infrastructure and conflict multiply climate risks.',
    sources: 'WHO; UN OCHA; World Weather Attribution (2023)'
  },
  {
    id: 'egypt', name: 'Egypt', match: ['Egypt'], flag: '🇪🇬', region: 'North Africa',
    lat: 27, lon: 30, zoom: 1.9, hazard: 'sea', risk: 'High',
    headline: 'The Nile Delta — Egypt’s breadbasket — is sinking and salting',
    stat: { value: '~97%', label: 'of Egypt’s fresh water comes from the Nile' },
    issues: [
      { type: 'sea',     title: 'Rising Mediterranean', text: 'The low-lying Nile Delta is home to around 40% of Egyptians and much of its farmland.' },
      { type: 'drought', title: 'Water stress', text: 'Rising demand and heat put pressure on Nile water.' },
      { type: 'heat',    title: 'Heatwaves', text: 'Summer heatwaves regularly push temperatures above 45°C in Upper Egypt.' }
    ],
    action: 'Egypt hosted COP27 (2022), where countries agreed to create a Loss and Damage Fund.',
    sources: 'UNDP; IPCC AR6; UNFCCC'
  },
  {
    id: 'spain', name: 'Spain', match: ['Spain'], flag: '🇪🇸', region: 'Southern Europe',
    lat: 40, lon: -3.7, zoom: 1.8, hazard: 'heat', risk: 'High',
    headline: 'Europe’s frontline of heat, drought and flash floods',
    stat: { value: '11,324', label: 'heat-related deaths in Spain in the summer of 2022' },
    issues: [
      { type: 'flood',   title: 'Valencia floods', text: 'In October 2024 a “DANA” storm killed over 220 people; Chiva received 491 mm of rain in 8 hours.' },
      { type: 'heat',    title: 'Killer heat', text: 'Summer 2022 was Europe’s hottest on record; Spain had the second-most heat deaths in Europe.' },
      { type: 'drought', title: 'Desertification', text: 'About three-quarters of Spain’s land is at risk of desertification.' }
    ],
    action: 'Spain’s 2021 Climate Change Law bans new fossil-fuel exploration licences.',
    sources: 'Ballester et al., Nature Medicine (2023); AEMET; Spanish Ministry for Ecological Transition'
  },
  {
    id: 'france', name: 'France', match: ['France'], flag: '🇫🇷', region: 'Western Europe',
    lat: 46.6, lon: 2.4, zoom: 1.8, hazard: 'heat', risk: 'High',
    headline: 'Heatwaves are becoming deadlier and more frequent',
    stat: { value: '46.0°C', label: 'France’s national heat record (June 2019)' },
    issues: [
      { type: 'heat',    title: '2003 heatwave', text: 'About 15,000 people died in France during the 2003 heatwave.' },
      { type: 'drought', title: '2022 drought', text: 'The driest summer on record left more than 100 towns without drinking water from the tap.' },
      { type: 'ice',     title: 'Alpine glaciers', text: 'The Mer de Glace on Mont Blanc is thinning and retreating every year.' }
    ],
    action: 'France hosted COP21 in 2015, where the Paris Agreement was signed.',
    sources: 'Météo-France; Inserm; French Ministry of Ecological Transition'
  },
  {
    id: 'uk', name: 'United Kingdom', match: ['United Kingdom'], flag: '🇬🇧', region: 'Western Europe',
    lat: 53.5, lon: -2, zoom: 1.75, hazard: 'flood', risk: 'Moderate',
    headline: 'A cool, rainy country that has now passed 40°C',
    stat: { value: '40.3°C', label: 'first-ever 40°C day recorded in the UK (19 July 2022)' },
    issues: [
      { type: 'heat',  title: 'Record heat', text: 'The Met Office says 40°C days are now about 10 times more likely than in a natural climate.' },
      { type: 'flood', title: 'Winter flooding', text: 'Wetter winters and stronger storms are flooding homes and farmland more often.' },
      { type: 'sea',   title: 'Coastal retreat', text: 'Fairbourne in Wales may become the first UK village to be “decommissioned” because of sea-level rise.' }
    ],
    action: 'The UK’s Climate Change Act (2008) was the world’s first legally binding national climate target.',
    sources: 'UK Met Office; Gwynedd Council'
  },
  {
    id: 'netherlands', name: 'Netherlands', match: ['Netherlands'], flag: '🇳🇱', region: 'Western Europe',
    lat: 52.2, lon: 5.4, zoom: 1.45, hazard: 'sea', risk: 'High',
    headline: 'A quarter of the country is below sea level',
    stat: { value: '26%', label: 'of the land lies below sea level — and 59% is prone to flooding' },
    issues: [
      { type: 'sea',   title: 'Rising North Sea', text: 'Dikes, dunes and storm barriers must be raised as sea levels climb.' },
      { type: 'flood', title: 'River floods', text: 'Heavier rainfall swells the Rhine and Meuse rivers.' },
      { type: 'drought', title: 'Summer drought', text: 'Dry summers lower river levels, letting salt water creep inland.' }
    ],
    action: 'The Delta Works and “Room for the River” programme are world-leading flood defences.',
    sources: 'PBL Netherlands Environmental Assessment Agency; Rijkswaterstaat'
  },
  {
    id: 'germany', name: 'Germany', match: ['Germany'], flag: '🇩🇪', region: 'Central Europe',
    lat: 51, lon: 10, zoom: 1.75, hazard: 'flood', risk: 'Moderate',
    headline: 'Even rich countries are not safe',
    stat: { value: '180+', label: 'deaths in the July 2021 floods in western Germany' },
    issues: [
      { type: 'flood',   title: 'Ahr Valley floods', text: 'Climate change made the 2021 rainfall up to 9 times more likely. Damage exceeded €30 billion.' },
      { type: 'drought', title: 'Low Rhine', text: 'In 2018 and 2022 the Rhine got so low that cargo ships could not sail fully loaded.' },
      { type: 'heat',    title: 'Forest dieback', text: 'Heat and drought have killed large areas of spruce forest.' }
    ],
    action: 'Germany aims for climate neutrality by 2045.',
    sources: 'World Weather Attribution (2021); German Federal Government'
  },
  {
    id: 'switzerland', name: 'Switzerland', match: ['Switzerland'], flag: '🇨🇭', region: 'Alps',
    lat: 46.6, lon: 8.1, zoom: 1.4, hazard: 'ice', risk: 'High',
    headline: 'Glaciers vanishing at record speed',
    stat: { value: '10%', label: 'of all Swiss glacier volume lost in just two years (2022–2023)' },
    issues: [
      { type: 'ice',   title: 'Record glacier melt', text: 'Swiss glaciers lost 6% of their volume in 2022 and 4% in 2023.' },
      { type: 'flood', title: 'Blatten buried', text: 'In May 2025 the Birch glacier collapsed and buried most of the village of Blatten (residents had been evacuated).' },
      { type: 'heat',  title: 'Alpine warming', text: 'Switzerland has warmed about twice as much as the global average since pre-industrial times.' }
    ],
    action: 'In 2024 the European Court of Human Rights ruled Switzerland violated human rights by not doing enough on climate.',
    sources: 'GLAMOS; MeteoSwiss; ECHR KlimaSeniorinnen v. Switzerland (2024)'
  },
  {
    id: 'italy', name: 'Italy', match: ['Italy'], flag: '🇮🇹', region: 'Southern Europe',
    lat: 42.5, lon: 12.8, zoom: 1.8, hazard: 'heat', risk: 'High',
    headline: 'Europe’s hottest day ever recorded',
    stat: { value: '48.8°C', label: 'in Sicily (Aug 2021) — the European temperature record' },
    issues: [
      { type: 'sea',   title: 'Venice flooding', text: 'In 2019 Venice’s tide reached 187 cm, the second-highest ever. MOSE flood barriers now rise many times a year.' },
      { type: 'ice',   title: 'Glacier collapse', text: 'In July 2022 part of the Marmolada glacier collapsed in a heatwave, killing 11 hikers.' },
      { type: 'flood', title: 'Emilia-Romagna floods', text: 'May 2023 floods killed 17 and forced 36,000 people from their homes.' }
    ],
    action: 'Venice’s €6 billion MOSE barrier system was first raised in 2020.',
    sources: 'WMO; City of Venice; Italian Civil Protection'
  },
  {
    id: 'greece', name: 'Greece', match: ['Greece'], flag: '🇬🇷', region: 'Southern Europe',
    lat: 39.2, lon: 22, zoom: 1.65, hazard: 'fire', risk: 'High',
    headline: 'Wildfires and floods in the same summer',
    stat: { value: '~94,000 ha', label: 'burned by the Evros fire (2023) — the largest wildfire recorded in the EU' },
    issues: [
      { type: 'fire',  title: 'Mega-fires', text: 'In July 2023 about 19,000 people were evacuated from Rhodes — Greece’s largest fire evacuation.' },
      { type: 'flood', title: 'Storm Daniel', text: 'Weeks later, Storm Daniel flooded the Thessaly plain, Greece’s farming heartland.' },
      { type: 'heat',  title: 'Heatwaves', text: 'Repeated 40°C+ heatwaves closed the Acropolis in 2023 and 2024.' }
    ],
    action: 'Greece created a Ministry for Climate Crisis and Civil Protection in 2021.',
    sources: 'EFFIS (EU Copernicus); Greek Fire Service'
  },
  {
    id: 'saudiarabia', name: 'Saudi Arabia', match: ['Saudi Arabia'], flag: '🇸🇦', region: 'Middle East',
    lat: 23.5, lon: 45, zoom: 2.0, hazard: 'heat', risk: 'High',
    headline: 'Heat already at the limits of human survival',
    stat: { value: '1,301', label: 'Hajj pilgrims died in extreme heat in June 2024' },
    issues: [
      { type: 'heat',    title: 'Deadly Hajj', text: 'Temperatures at the Grand Mosque in Mecca reached 51.8°C during the 2024 pilgrimage.' },
      { type: 'drought', title: 'Water scarcity', text: 'The country depends on energy-intensive desalination for drinking water.' },
      { type: 'heat',    title: 'Dust storms', text: 'Drier soils across the region are increasing dust storms.' }
    ],
    action: 'Saudi Arabia has a target of net-zero emissions by 2060. In the capital, Green Riyadh aims to plant 7.5 million trees by 2030, irrigated with treated water.',
    sources: 'Saudi Ministry of Health; Saudi National Center for Meteorology; Royal Commission for Riyadh City'
  },
  {
    id: 'iraq', name: 'Iraq', match: ['Iraq'], flag: '🇮🇶', region: 'Middle East',
    lat: 33, lon: 44, zoom: 1.8, hazard: 'drought', risk: 'Very high',
    headline: 'The land between two rivers is drying out',
    stat: { value: '5th', label: 'most vulnerable country to climate breakdown (UN)' },
    issues: [
      { type: 'heat',    title: '50°C summers', text: 'Basra recorded 53.9°C in 2016; summer temperatures above 50°C are now common.' },
      { type: 'drought', title: 'Shrinking rivers', text: 'Drought and upstream dams have cut the flow of the Tigris and Euphrates.' },
      { type: 'heat',    title: 'Dust storms', text: 'In 2022 a wave of dust storms sent thousands of people to hospital.' }
    ],
    action: 'Iraq joined the Paris Agreement in 2021.',
    sources: 'UNEP; WMO; Iraqi Ministry of Health'
  },
  {
    id: 'pakistan', name: 'Pakistan', match: ['Pakistan'], flag: '🇵🇰', region: 'South Asia',
    lat: 29.5, lon: 69.5, zoom: 1.9, hazard: 'flood', risk: 'Extreme',
    headline: 'Less than 1% of global emissions — some of the worst impacts',
    stat: { value: '33M', label: 'people affected by the 2022 monsoon floods' },
    issues: [
      { type: 'flood', title: '2022 mega-floods', text: 'About 1,700 people died and damage and losses topped $30 billion.' },
      { type: 'heat',  title: 'Extreme heat', text: 'Jacobabad regularly passes 50°C and is one of the hottest cities on Earth.' },
      { type: 'ice',   title: 'Glacial lake floods', text: 'Over 3,000 glacial lakes have formed in the north; dozens risk sudden outburst floods.' }
    ],
    action: 'Pakistan led the push for the Loss and Damage Fund agreed at COP27.',
    sources: 'Government of Pakistan Post-Disaster Needs Assessment (2022); UNDP'
  },
  {
    id: 'india', name: 'India', match: ['India'], flag: '🇮🇳', region: 'South Asia',
    lat: 22, lon: 79, zoom: 2.0, hazard: 'heat', risk: 'Very high',
    headline: '1.4 billion people facing hotter heatwaves',
    stat: { value: '50.5°C', label: 'recorded in Churu, Rajasthan (May 2024)' },
    issues: [
      { type: 'heat',    title: 'Heatwaves', text: 'Heatwaves are starting earlier and lasting longer, threatening outdoor workers and crops.' },
      { type: 'drought', title: 'Water stress', text: 'About 600 million Indians face high to extreme water stress.' },
      { type: 'flood',   title: 'Floods & landslides', text: 'In July 2024 landslides in Wayanad, Kerala killed over 200 people after extreme rain.' }
    ],
    action: 'India has installed over 100 GW of solar power and targets net zero by 2070.',
    sources: 'India Meteorological Department; NITI Aayog (2018); Kerala State Disaster Management Authority'
  },
  {
    id: 'nepal', name: 'Nepal', match: ['Nepal'], flag: '🇳🇵', region: 'Himalaya',
    lat: 28.3, lon: 84, zoom: 1.6, hazard: 'ice', risk: 'Very high',
    headline: 'The “Third Pole” is melting',
    stat: { value: '65%', label: 'faster Himalayan glacier loss in the 2010s than the decade before' },
    issues: [
      { type: 'ice',   title: 'Himalayan glaciers', text: 'Glaciers here could lose up to 80% of their volume by 2100 if emissions stay high.' },
      { type: 'flood', title: 'Glacial lake outbursts', text: 'In August 2024 a glacial lake flood swept through the Sherpa village of Thame near Everest.' },
      { type: 'drought', title: 'Water for 2 billion', text: 'Hindu Kush Himalaya rivers supply water to nearly 2 billion people downstream.' }
    ],
    action: 'Nepal’s forests have grown back significantly thanks to community forestry.',
    sources: 'ICIMOD (2023)'
  },
  {
    id: 'bangladesh', name: 'Bangladesh', match: ['Bangladesh'], flag: '🇧🇩', region: 'South Asia',
    lat: 23.7, lon: 90.3, zoom: 1.55, hazard: 'flood', risk: 'Extreme',
    headline: 'One of the most climate-exposed nations on Earth',
    stat: { value: '19.9M', label: 'people could become internal climate migrants by 2050' },
    issues: [
      { type: 'sea',   title: 'Rising seas', text: 'About two-thirds of the country is less than 5 m above sea level; salt water is ruining farmland.' },
      { type: 'flood', title: 'Record floods', text: 'The 2022 Sylhet floods affected about 7.2 million people.' },
      { type: 'storm', title: 'Cyclones', text: 'Powerful cyclones such as Amphan (2020) strike the Bay of Bengal coast.' }
    ],
    action: 'Early warnings and cyclone shelters cut cyclone deaths from ~300,000 (1970) to about 26 (Amphan, 2020).',
    sources: 'World Bank Groundswell (2021); UNICEF; Bangladesh Ministry of Disaster Management'
  },
  {
    id: 'maldives', name: 'Maldives', match: ['Maldives'], flag: '🇲🇻', region: 'Indian Ocean',
    lat: 3.2, lon: 73.2, zoom: 1.4, hazard: 'sea', risk: 'Extreme',
    headline: 'The world’s lowest country',
    stat: { value: '80%', label: 'of the land is less than 1 metre above sea level' },
    issues: [
      { type: 'sea',  title: 'Disappearing islands', text: 'Rising seas and stronger waves threaten to make many islands uninhabitable this century.' },
      { type: 'heat', title: 'Coral bleaching', text: 'Marine heatwaves bleach the coral reefs that protect the islands and feed the tourism economy.' },
      { type: 'drought', title: 'Fresh water', text: 'Salt water is contaminating the thin freshwater layers under the islands.' }
    ],
    action: 'The Maldives is building Hulhumalé, a raised artificial island ~2 m above sea level.',
    sources: 'World Bank; IPCC Special Report on Oceans & Cryosphere'
  },
  {
    id: 'china', name: 'China', match: ['China', 'Taiwan'], flag: '🇨🇳', region: 'East Asia',
    lat: 33, lon: 105, zoom: 2.2, hazard: 'flood', risk: 'High',
    headline: 'World’s largest emitter — and facing record extremes',
    stat: { value: '201.9 mm', label: 'of rain in ONE hour in Zhengzhou (July 2021) — a national record' },
    issues: [
      { type: 'flood',   title: 'Zhengzhou floods', text: 'The 2021 floods in Henan province killed 398 people, many trapped in a subway.' },
      { type: 'heat',    title: '2022 heatwave', text: 'A 70-day heatwave dried parts of the Yangtze River and caused power shortages in Sichuan.' },
      { type: 'sea',     title: 'Sinking coasts', text: 'Shanghai and other coastal megacities face sea-level rise plus land subsidence.' }
    ],
    action: 'China emits ~31% of global CO₂ but also installs more solar and wind power than the rest of the world combined.',
    sources: 'China Ministry of Emergency Management; China Meteorological Administration; Global Carbon Project'
  },
  {
    id: 'mongolia', name: 'Mongolia', match: ['Mongolia'], flag: '🇲🇳', region: 'Central Asia',
    lat: 46.8, lon: 103, zoom: 1.9, hazard: 'heat', risk: 'High',
    headline: 'Warming more than twice as fast as the world',
    stat: { value: '7M+', label: 'livestock killed by the extreme winter (dzud) of 2024' },
    issues: [
      { type: 'heat',    title: '+2.2°C already', text: 'Mongolia has warmed by about 2.2°C since 1940.' },
      { type: 'drought', title: 'Desertification', text: 'More than three-quarters of the land is affected by degradation and desertification.' },
      { type: 'ice',     title: 'Deadly dzud', text: 'Summer drought followed by extreme winter snow starves herds that nomadic families depend on.' }
    ],
    action: 'Mongolia’s “Billion Trees” campaign aims to fight desertification by 2030.',
    sources: 'Mongolian Ministry of Environment; UN Mongolia; IFRC'
  },
  {
    id: 'russia', name: 'Russia', match: ['Russia'], flag: '🇷🇺', region: 'Northern Eurasia',
    lat: 63, lon: 100, zoom: 2.4, hazard: 'ice', risk: 'High',
    headline: 'The ground itself is thawing',
    stat: { value: '38.0°C', label: 'in Verkhoyansk, Siberia (June 2020) — the Arctic temperature record' },
    issues: [
      { type: 'ice',  title: 'Permafrost thaw', text: 'About 65% of Russia sits on permafrost; as it thaws, buildings, pipelines and roads crack.' },
      { type: 'fire', title: 'Siberian wildfires', text: 'Record fires in Yakutia in 2021 burned millions of hectares of forest.' },
      { type: 'flood', title: 'Norilsk spill', text: 'In 2020 a fuel tank collapsed, spilling ~21,000 tonnes of diesel — blamed partly on thawing ground.' }
    ],
    action: 'Russia is the world’s 4th largest CO₂ emitter.',
    sources: 'WMO; Russian Academy of Sciences; Global Carbon Project'
  },
  {
    id: 'vietnam', name: 'Vietnam', match: ['Vietnam'], flag: '🇻🇳', region: 'Southeast Asia',
    lat: 14.5, lon: 107.5, zoom: 1.75, hazard: 'storm', risk: 'Very high',
    headline: 'The Mekong Delta rice bowl is under threat',
    stat: { value: '~50%', label: 'of Vietnam’s rice is grown in the low-lying Mekong Delta' },
    issues: [
      { type: 'sea',   title: 'Salt intrusion', text: 'Rising seas and drought push salt water far up the Mekong, ruining rice fields.' },
      { type: 'storm', title: 'Typhoon Yagi', text: 'In 2024 Asia’s strongest storm of the year left about 300 people dead or missing in Vietnam.' },
      { type: 'flood', title: 'Sinking delta', text: 'Parts of the delta are sinking several centimetres a year from groundwater pumping.' }
    ],
    action: 'Vietnam is restoring mangrove forests as natural sea walls.',
    sources: 'Vietnam Disaster and Dyke Management Authority; World Bank'
  },
  {
    id: 'philippines', name: 'Philippines', match: ['Philippines'], flag: '🇵🇭', region: 'Southeast Asia',
    lat: 12.5, lon: 122, zoom: 1.8, hazard: 'storm', risk: 'Extreme',
    headline: 'The world’s most at-risk country for disasters',
    stat: { value: '#1', label: 'on the WorldRiskIndex in 2022, 2023 and 2024' },
    issues: [
      { type: 'storm', title: 'Super typhoons', text: 'About 20 tropical cyclones enter Philippine waters each year. Typhoon Haiyan (2013) killed over 6,300 people.' },
      { type: 'storm', title: 'Six storms in a month', text: 'Between October and November 2024, six storms hit the country in under four weeks.' },
      { type: 'sea',   title: 'Fast sea-level rise', text: 'Seas around Manila are rising much faster than the global average, worsened by land subsidence.' }
    ],
    action: 'The Philippines hosts the board of the new UN Fund for Responding to Loss and Damage.',
    sources: 'WorldRiskReport (Bündnis Entwicklung Hilft); NDRRMC; PAGASA'
  },
  {
    id: 'indonesia', name: 'Indonesia', match: ['Indonesia'], flag: '🇮🇩', region: 'Southeast Asia',
    lat: -2.5, lon: 113, zoom: 2.0, hazard: 'sea', risk: 'Very high',
    headline: 'A capital city so flooded it is being moved',
    stat: { value: '25 cm', label: 'per year — the fastest sinking rate in parts of North Jakarta' },
    issues: [
      { type: 'sea',  title: 'Sinking Jakarta', text: 'About 40% of Jakarta is below sea level. The capital is moving to Nusantara on Borneo.' },
      { type: 'fire', title: 'Peatland fires', text: 'Burning peat forests on Borneo and Sumatra release huge amounts of CO₂ and toxic haze.' },
      { type: 'flood', title: 'Flash floods', text: 'Heavier monsoon rain triggers floods and landslides across the archipelago.' }
    ],
    action: 'Indonesia is restoring mangroves on a national scale to protect coasts.',
    sources: 'Bandung Institute of Technology; Indonesian Government; BNPB'
  },
  {
    id: 'australia', name: 'Australia', match: ['Australia'], flag: '🇦🇺', region: 'Oceania',
    lat: -25, lon: 134, zoom: 2.3, hazard: 'fire', risk: 'High',
    headline: 'Black Summer: one of the worst wildfire seasons ever recorded',
    stat: { value: '~3 billion', label: 'animals killed or displaced by the 2019–20 bushfires' },
    issues: [
      { type: 'fire', title: 'Black Summer', text: 'About 24 million hectares burned in 2019–20.' },
      { type: 'heat', title: 'Great Barrier Reef', text: 'Mass coral bleaching struck in 2016, 2017, 2020, 2022 and 2024.' },
      { type: 'flood', title: 'Extreme floods', text: 'In 2022 record floods devastated Lismore and much of New South Wales and Queensland.' }
    ],
    action: 'Australia legislated a 43% emissions cut by 2030 and net zero by 2050 (Climate Change Act 2022).',
    sources: 'WWF-Australia (2020); AIMS; Australian Government'
  },
  {
    id: 'kiribati', name: 'Kiribati', match: ['Kiribati'], flag: '🇰🇮', region: 'Pacific Ocean',
    lat: 1.4, lon: 173, zoom: 1.4, hazard: 'sea', risk: 'Extreme',
    headline: 'A nation that bought land in another country',
    stat: { value: '~20 km²', label: 'of land bought in Fiji (2014) as insurance against rising seas' },
    issues: [
      { type: 'sea',     title: 'Rising seas', text: 'Most of the land on its atolls is less than 3 m above sea level.' },
      { type: 'drought', title: 'Salty water', text: 'Sea water is seeping into the groundwater that families drink and farm with.' },
      { type: 'storm',   title: 'King tides', text: 'Higher tides and storm waves flood homes and erode coastlines.' }
    ],
    action: '“Migration with dignity” — Kiribati trains citizens for jobs abroad in case relocation becomes necessary.',
    sources: 'Government of Kiribati; IPCC AR6'
  },
  {
    id: 'tuvalu', name: 'Tuvalu', match: [], flag: '🇹🇻', region: 'Pacific Ocean',
    lat: -8.52, lon: 179.2, zoom: 1.35, hazard: 'sea', risk: 'Extreme',
    headline: 'A country that might have to move its people',
    stat: { value: '4.6 m', label: 'highest point in the entire country' },
    issues: [
      { type: 'sea',   title: 'Half the capital flooded', text: 'By 2050, daily tides could flood about half of the capital, Funafuti.' },
      { type: 'storm', title: 'Storm surges', text: 'Cyclone waves can wash over whole islands.' },
      { type: 'sea',   title: 'Climate visas', text: 'Under a 2023 treaty, Australia offers residency to up to 280 Tuvaluans a year.' }
    ],
    action: 'Tuvalu is creating a “digital twin” of the nation and reclaiming land to raise parts of Funafuti.',
    sources: 'Tuvalu Coastal Adaptation Project; Falepili Union Treaty (2023)'
  },
  {
    id: 'arctic', name: 'Arctic Ocean', match: [], flag: '🧊', region: 'Arctic',
    lat: 84, lon: 30, zoom: 2.3, hazard: 'ice', risk: 'Extreme',
    headline: 'Warming nearly four times faster than the rest of the planet',
    stat: { value: '4×', label: 'faster warming than the global average since 1979' },
    issues: [
      { type: 'ice',  title: 'Disappearing sea ice', text: 'September sea ice is shrinking about 12% per decade.' },
      { type: 'ice',  title: 'Ice-free summers', text: 'The Arctic could see its first practically ice-free September before 2050.' },
      { type: 'heat', title: 'Feedback loop', text: 'Less white ice means more dark ocean absorbing sunlight — which causes more warming.' }
    ],
    action: 'Reducing global emissions is the only way to slow Arctic warming.',
    sources: 'Rantanen et al., Communications Earth & Environment (2022); NASA; IPCC AR6'
  }
];
