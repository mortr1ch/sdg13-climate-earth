/* Realistic Earth renderer (three.js r149, no build step).
   - Day/night with city lights, ocean sun-glint, terrain bump, moving clouds + shadows
   - Atmospheric limb glow, starfield + Milky Way
   - Climate layers: warming map, active-fire hotspots, rotating tropical cyclones
   - Country hotspots: pulsing markers, borders, focus detection while zooming */
(function () {
  'use strict';

  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const FOV = 30;
  const HOME_DIST = 4.6;
  const MIN_DIST = 1.12;
  const MAX_DIST = 9;
  const FOCUS_DIST = 2.65;   // closer than this = "near a country"

  function latLonToVec3(lat, lon, r = 1, out = new THREE.Vector3()) {
    const la = lat * D2R, lo = lon * D2R;
    return out.set(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));
  }
  function vec3ToLatLon(v) {
    const n = v.clone().normalize();
    return { lat: Math.asin(clamp(n.y, -1, 1)) * R2D, lon: Math.atan2(-n.z, n.x) * R2D };
  }
  function angularDist(lat1, lon1, lat2, lon2) {
    const a = Math.sin((lat2 - lat1) * D2R / 2) ** 2 +
      Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin((lon2 - lon1) * D2R / 2) ** 2;
    return 2 * Math.asin(Math.min(1, Math.sqrt(a))) * R2D;
  }
  const wrapLon = lon => ((((lon + 180) % 360) + 360) % 360) - 180;

  // Sub-solar point for a date (low-precision solar ephemeris, good to ~0.1°)
  function subsolarPoint(date) {
    const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const g = (357.529 + 0.98560028 * d) * D2R;
    const q = 280.459 + 0.98564736 * d;
    const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * D2R;
    const e = (23.439 - 0.00000036 * d) * D2R;
    const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) * R2D;
    const decl = Math.asin(Math.sin(e) * Math.sin(L)) * R2D;
    const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    return { lat: decl, lon: wrapLon(ra - gmst * 15) };
  }

  /* ------------------------------------------------------------------ shaders */

  const GLSL_COMMON = `
    vec3 aces(vec3 x){ const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
  `;

  const SURFACE_VERT = `
    varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vObjN;
    void main(){
      vUv = uv; vObjN = normal;
      vN = normalize(mat3(modelMatrix) * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0); vP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `;

  const EARTH_FRAG = `
    uniform sampler2D tDay, tNight, tBrc, tOcean;
    uniform vec3 uSun;
    uniform float uCloudOffset, uCloudsOn, uHeat, uBump, uExposure;
    varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vObjN;
    ${GLSL_COMMON}

    vec3 perturb(vec3 pos, vec3 n, vec2 dH){
      vec3 sx = dFdx(pos), sy = dFdy(pos);
      vec3 r1 = cross(sy, n), r2 = cross(n, sx);
      float det = dot(sx, r1);
      vec3 grad = sign(det) * (dH.x * r1 + dH.y * r2);
      return normalize(abs(det) * n - grad);
    }

    // NASA-style anomaly colour ramp (deg C)
    vec3 heatRamp(float a){
      vec3 c = vec3(0.23,0.44,0.85);
      c = mix(c, vec3(0.61,0.76,0.94), smoothstep(-1.0,-0.4,a));
      c = mix(c, vec3(0.96,0.95,0.92), smoothstep(-0.4, 0.0,a));
      c = mix(c, vec3(1.00,0.88,0.54), smoothstep( 0.0, 0.6,a));
      c = mix(c, vec3(1.00,0.70,0.28), smoothstep( 0.6, 1.2,a));
      c = mix(c, vec3(1.00,0.48,0.18), smoothstep( 1.2, 1.9,a));
      c = mix(c, vec3(0.91,0.22,0.16), smoothstep( 1.9, 2.8,a));
      c = mix(c, vec3(0.62,0.06,0.18), smoothstep( 2.8, 4.0,a));
      return c;
    }

    // Spatial pattern of recent warming (based on NASA GISTEMP 2015-2024 maps):
    // land warms faster than ocean, Arctic amplification, N. Atlantic "warming hole",
    // muted Southern Ocean, plus regional variability.
    float anomaly(vec3 n, float lat, float lon, float land){
      float a = 0.80 + 0.80 * land;
      a += 2.6 * smoothstep(52.0, 82.0, lat);
      a += 0.6 * land * smoothstep(35.0, 60.0, lat);
      a += 0.35 * land * (1.0 - smoothstep(10.0, 35.0, abs(lat - 25.0))); // Sahara / Middle East
      a -= 1.5 * exp(-pow((lat - 56.0) / 7.0, 2.0) - pow((lon + 38.0) / 13.0, 2.0));
      a -= 0.75 * (1.0 - land) * smoothstep(-45.0, -62.0, lat);
      a += 0.45 * exp(-pow((lat + 65.0) / 6.0, 2.0) - pow((lon + 62.0) / 12.0, 2.0)); // Antarctic Peninsula
      a += 0.70 * snoise(n * 2.1) + 0.30 * snoise(n * 5.3 + 7.0);
      return a;
    }

    void main(){
      vec4 brc = texture2D(tBrc, vUv);
      float land = smoothstep(0.06, 0.22, brc.g);
      float ocean = 1.0 - land;

      vec3 Ng = normalize(vN);
      vec2 dx = dFdx(vUv), dy = dFdy(vUv);
      float h0 = brc.r;
      vec2 dH = vec2(texture2D(tBrc, vUv + dx).r - h0, texture2D(tBrc, vUv + dy).r - h0) * uBump * land;
      vec3 N = perturb(vP, Ng, dH);

      vec3 L = normalize(uSun);
      vec3 V = normalize(cameraPosition - vP);
      float sunG = dot(Ng, L);
      float diff = max(dot(N, L), 0.0) * smoothstep(-0.05, 0.12, sunG);
      float dayF = smoothstep(-0.18, 0.12, sunG);

      vec3 dayC = pow(texture2D(tDay, vUv).rgb, vec3(2.2));
      vec3 oceanC = pow(texture2D(tOcean, vUv).rgb, vec3(2.2)) * vec3(0.75, 0.9, 1.0);
      vec3 albedo = mix(oceanC, dayC * 1.05, land);

      vec2 cUv = vUv + vec2(uCloudOffset, 0.0);
      float cloud = smoothstep(0.18, 0.85, texture2D(tBrc, cUv).b) * uCloudsOn;
      float cShadow = smoothstep(0.18, 0.85, texture2D(tBrc, cUv + vec2(0.0018, 0.0012)).b) * uCloudsOn;

      vec3 sunCol = mix(vec3(1.0, 0.42, 0.18), vec3(1.0, 0.97, 0.93), smoothstep(0.0, 0.3, sunG));
      vec3 col = albedo * diff * sunCol * 1.75 * (1.0 - 0.55 * cShadow);
      col += albedo * 0.003;

      // warming map
      if (uHeat > 0.001){
        float lat = (vUv.y - 0.5) * 180.0;
        float lon = vUv.x * 360.0 - 180.0;
        float a = anomaly(normalize(vObjN), lat, lon, land);
        vec3 hc = pow(heatRamp(a), vec3(2.2));
        float s = a > 0.0 ? mix(0.10, 0.85, smoothstep(0.3, 3.0, a)) : mix(0.10, 0.7, smoothstep(0.0, -1.2, a));
        col = mix(col, hc * (diff * 1.25 + 0.03), uHeat * s);
      }

      // ocean sun-glint
      vec3 H = normalize(L + V);
      float ndh = max(dot(Ng, H), 0.0);
      float spec = pow(ndh, 900.0) * 0.55 + pow(ndh, 80.0) * 0.06 + pow(ndh, 10.0) * 0.012;
      col += vec3(1.0, 0.86, 0.66) * spec * ocean * smoothstep(0.0, 0.15, sunG) * (1.0 - cloud) * (1.0 - uHeat * 0.6);

      // city lights on the night side
      vec3 nightC = texture2D(tNight, vUv).rgb;
      float li = max(dot(nightC, vec3(0.45, 0.4, 0.15)) - 0.075, 0.0);
      vec3 lights = vec3(1.0, 0.68, 0.36) * pow(li * 2.2, 1.7) * 2.2;
      col += lights * (1.0 - dayF) * (1.0 - 0.8 * cloud);

      // atmospheric scattering towards the limb
      float fres = pow(1.0 - max(dot(Ng, V), 0.0), 2.4);
      float atmoLit = smoothstep(-0.25, 0.5, sunG);
      vec3 atmo = mix(vec3(0.9, 0.38, 0.18), vec3(0.28, 0.55, 1.0), smoothstep(-0.05, 0.35, sunG));
      col = mix(col, atmo * atmoLit * 0.9, fres * 0.7);
      col += vec3(0.05, 0.10, 0.22) * 0.05 * atmoLit;

      col = aces(col * uExposure);
      gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
    }
  `;

  const CLOUD_FRAG = `
    uniform sampler2D tBrc; uniform vec3 uSun; uniform float uCloudOffset, uOpacity;
    varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vObjN;
    ${GLSL_COMMON}
    void main(){
      float c = smoothstep(0.18, 0.85, texture2D(tBrc, vUv + vec2(uCloudOffset, 0.0)).b);
      vec3 N = normalize(vN); vec3 L = normalize(uSun); vec3 V = normalize(cameraPosition - vP);
      float ndl = dot(N, L);
      vec3 sunCol = mix(vec3(1.0, 0.45, 0.22), vec3(1.0), smoothstep(0.0, 0.35, ndl));
      vec3 col = sunCol * (max(ndl, 0.0) * 1.0 + 0.008);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
      float a = c * uOpacity * (1.0 - fres * 0.6);
      col = aces(col * 0.95);
      gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), a);
    }
  `;

  const ATMO_VERT = `
    varying vec3 vP;
    void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }
  `;
  const ATMO_FRAG = `
    uniform vec3 uSun; uniform float uThick;
    varying vec3 vP;
    void main(){
      vec3 O = cameraPosition; vec3 D = normalize(vP - O);
      float t = -dot(O, D); vec3 P = O + D * t; float d = length(P);
      float h = (d - 1.0) / uThick;
      float dens = exp(-max(h, 0.0) * 5.0) * (1.0 - smoothstep(0.7, 1.0, h));
      if (h < 0.0) dens = exp(h * 10.0);
      float s = dot(normalize(P), normalize(uSun));
      float lit = smoothstep(-0.35, 0.3, s);
      vec3 col = mix(vec3(1.0, 0.42, 0.18), vec3(0.32, 0.6, 1.0), smoothstep(-0.1, 0.35, s));
      float a = dens * lit;
      gl_FragColor = vec4(col * a * 1.25, a);
    }
  `;

  const MARKER_VERT = `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `;
  const MARKER_FRAG = `
    uniform vec3 uColor; uniform float uTime, uPhase, uActive, uFade;
    varying vec2 vUv;
    float ring(float r, float t){ float rr = 0.14 + t * 0.86; return smoothstep(0.07, 0.0, abs(r - rr)) * (1.0 - t); }
    void main(){
      vec2 p = vUv * 2.0 - 1.0; float r = length(p);
      float core = smoothstep(0.15, 0.09, r);
      float halo = exp(-r * r * 16.0) * 0.55;
      float t1 = fract(uTime * 0.42 + uPhase), t2 = fract(uTime * 0.42 + uPhase + 0.5);
      float rings = (ring(r, t1) + ring(r, t2)) * (0.55 + uActive * 0.7);
      float a = (core + halo + rings) * uFade;
      vec3 col = mix(uColor, vec3(1.0), core * 0.55);
      gl_FragColor = vec4(col * a, a);
    }
  `;

  const FIRE_VERT = `
    attribute float aSeed; attribute float aSize;
    uniform float uTime, uScale, uPR; uniform vec3 uSun;
    varying float vA;
    void main(){
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vec3 n = normalize(wp.xyz);
      float day = smoothstep(-0.1, 0.25, dot(n, normalize(uSun)));
      float flick = 0.55 + 0.45 * sin(uTime * (2.0 + aSeed * 6.0) + aSeed * 50.0);
      vec3 V = normalize(cameraPosition - wp.xyz);
      vA = flick * mix(1.0, 0.6, day) * smoothstep(0.02, 0.25, dot(n, V));
      vec4 mv = viewMatrix * wp;
      gl_PointSize = clamp(aSize * uScale / -mv.z, 1.5 * uPR, 11.0 * uPR);
      gl_Position = projectionMatrix * mv;
    }
  `;
  const FIRE_FRAG = `
    uniform float uOpacity;
    varying float vA;
    void main(){
      float r = length(gl_PointCoord - 0.5) * 2.0;
      float a = exp(-r * r * 3.5) * vA * uOpacity;
      vec3 col = mix(vec3(1.0, 0.36, 0.06), vec3(1.0, 0.9, 0.6), exp(-r * r * 10.0));
      gl_FragColor = vec4(col * a, a);
    }
  `;

  const STORM_FRAG = `
    uniform sampler2D tStorm; uniform float uAngle, uHemi, uOpacity; uniform vec3 uSun, uNormal;
    varying vec2 vUv;
    ${GLSL_COMMON}
    void main(){
      vec2 p = vUv - 0.5; p.x *= uHemi;
      float c = cos(uAngle), s = sin(uAngle);
      p = mat2(c, -s, s, c) * p;
      float a = texture2D(tStorm, p + 0.5).a * smoothstep(0.5, 0.32, length(vUv - 0.5));
      float ndl = dot(normalize(uNormal), normalize(uSun));
      vec3 col = vec3(1.0) * (max(ndl, 0.0) * 1.15 + 0.012);
      col = aces(col * 0.95);
      gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), a * uOpacity);
    }
  `;

  const STAR_VERT = `
    attribute float aSize; attribute vec3 aColor; attribute float aSeed;
    uniform float uPR, uTime;
    varying vec3 vColor; varying float vTw;
    void main(){
      vColor = aColor;
      vTw = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 30.0);
      gl_PointSize = aSize * uPR;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const STAR_FRAG = `
    varying vec3 vColor; varying float vTw;
    void main(){
      float r = length(gl_PointCoord - 0.5) * 2.0;
      float a = exp(-r * r * 4.0) * vTw;
      gl_FragColor = vec4(vColor * a, a);
    }
  `;

  /* ------------------------------------------------------------------ helpers */

  function loadTexture(renderer, uri, repeat) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(uri, tex => {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        if (repeat) tex.wrapS = THREE.RepeatWrapping;
        resolve(tex);
      }, undefined, reject);
    });
  }

  function imageData(uri, w, h) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
        resolve(g.getImageData(0, 0, w, h));
      };
      img.src = uri;
    });
  }

  // Seeded random so fires / stars look identical on every load
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function stormTexture() {
    const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d'); g.translate(s / 2, s / 2);
    const rand = rng(7);
    const blob = (x, y, r, a) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    };
    blob(0, 0, 100, 0.9); blob(0, 0, 60, 0.9);
    for (let arm = 0; arm < 5; arm++) {
      for (let i = 0; i < 420; i++) {
        const t = i / 420;
        const ang = arm * (Math.PI * 2 / 5) + t * Math.PI * 2.4;
        const r = 30 + t * 200;
        const j = (rand() - 0.5) * r * 0.25;
        blob(Math.cos(ang) * (r + j), Math.sin(ang) * (r + j), 5 + rand() * 18 * (0.4 + t), 0.13 * (1 - t) + 0.025);
      }
    }
    g.globalCompositeOperation = 'destination-out';
    blob(0, 0, 16, 1); blob(0, 0, 9, 1);
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 40; i++) { const a = rand() * Math.PI * 2; blob(Math.cos(a) * 22, Math.sin(a) * 22, 12, 0.25); }
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function pointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function pointInPolys(lon, lat, polys) {
    for (const p of polys) {
      if (lon < p.bbox[0] || lon > p.bbox[2] || lat < p.bbox[1] || lat > p.bbox[3]) continue;
      let inside = false;
      for (const ring of p.rings) if (pointInRing(lon, lat, ring)) inside = !inside;
      if (inside) return true;
    }
    return false;
  }

  // WebGL can only draw 1px lines, so borders are drawn as quads widened in screen space.
  const LINE_VERT = `
    attribute vec3 aA; attribute vec3 aB; attribute float aSide; attribute float aEnd;
    uniform vec2 uRes; uniform float uWidth;
    varying float vFacing; varying float vSide;
    void main(){
      vec4 a = projectionMatrix * viewMatrix * vec4(aA, 1.0);
      vec4 b = projectionMatrix * viewMatrix * vec4(aB, 1.0);
      vec2 d = (b.xy / b.w - a.xy / a.w) * uRes;
      vec2 dir = length(d) > 1e-5 ? normalize(d) : vec2(1.0, 0.0);
      vec4 p = mix(a, b, aEnd);
      vec3 P = mix(aA, aB, aEnd);
      vFacing = dot(normalize(P), normalize(cameraPosition - P));
      vSide = aSide;
      p.xy += vec2(-dir.y, dir.x) * aSide * uWidth / uRes * p.w;
      gl_Position = p;
    }
  `;
  const LINE_FRAG = `
    uniform vec3 uColor; uniform float uOpacity;
    varying float vFacing; varying float vSide;
    void main(){
      float a = uOpacity * smoothstep(1.0, 0.55, abs(vSide)) * smoothstep(0.0, 0.12, vFacing);
      gl_FragColor = vec4(uColor, a);
    }
  `;

  function ringsToSegments(rings, r) {
    const pts = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    for (const ring of rings) {
      for (let i = 1; i < ring.length; i++) {
        const [lo0, la0] = ring[i - 1], [lo1, la1] = ring[i];
        if (Math.abs(lo1 - lo0) > 180) continue; // antimeridian jump
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(lo1 - lo0), Math.abs(la1 - la0)) / 1.5));
        for (let s = 0; s < steps; s++) {
          latLonToVec3(lerp(la0, la1, s / steps), lerp(lo0, lo1, s / steps), r, a);
          latLonToVec3(lerp(la0, la1, (s + 1) / steps), lerp(lo0, lo1, (s + 1) / steps), r, b);
          pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    return pts;
  }

  function thickLineGeometry(rings, r) {
    const pts = ringsToSegments(rings, r);
    const n = pts.length / 6;
    const A = new Float32Array(n * 12), B = new Float32Array(n * 12);
    const side = new Float32Array(n * 4), end = new Float32Array(n * 4);
    const index = new Uint32Array(n * 6);
    for (let i = 0; i < n; i++) {
      for (let v = 0; v < 4; v++) {
        const k = i * 4 + v;
        for (let c = 0; c < 3; c++) { A[k * 3 + c] = pts[i * 6 + c]; B[k * 3 + c] = pts[i * 6 + 3 + c]; }
        side[k] = v % 2 ? 1 : -1;
        end[k] = v < 2 ? 0 : 1;
      }
      const o = i * 4;
      index.set([o, o + 1, o + 2, o + 2, o + 1, o + 3], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('aA', new THREE.BufferAttribute(A, 3));
    geo.setAttribute('aB', new THREE.BufferAttribute(B, 3));
    geo.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(A, 3)); // three.js expects one; real positions come from the shader
    return geo;
  }

  /* ------------------------------------------------------------------ globe */

  const Globe = {
    latLonToVec3, vec3ToLatLon, angularDist, FOCUS_DIST, HOME_DIST,
    layers: { heat: true, fires: true, storms: true, clouds: true, labels: true, realsun: false },

    async init(canvas, handlers) {
      this.h = handlers || {};
      this.canvas = canvas;
      const renderer = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);

      const scene = this.scene = new THREE.Scene();
      const camera = this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 2000);
      // open facing Central Asia so Uzbekistan, the first stop, is in view
      this.view = { lat: 30, lon: 80, dist: MAX_DIST };
      this.target = { lat: 30, lon: 60, dist: HOME_DIST };
      this.vel = { lat: 0, lon: 0 };
      this.flight = null;
      this.pinned = null;
      this.focus = null;
      this.panelShift = 0; this.panelShiftTarget = 0;
      this.lastInteraction = performance.now() - 10000;
      this.autoRotate = true;
      this.sun = new THREE.Vector3(1, 0, 0);
      this.clock = new THREE.Clock();
      this.time = 0;
      this.cloudOffset = 0;

      const T = window.EARTH_TEXTURES;
      const [tDay, tNight, tBrc, tOcean, mask] = await Promise.all([
        loadTexture(renderer, T.day, true), loadTexture(renderer, T.night, true),
        loadTexture(renderer, T.brc, true), loadTexture(renderer, T.ocean, true),
        imageData(T.brc, 1024, 512)
      ]);
      this.landMask = mask;

      // Earth
      this.earthMat = new THREE.ShaderMaterial({
        uniforms: {
          tDay: { value: tDay }, tNight: { value: tNight }, tBrc: { value: tBrc }, tOcean: { value: tOcean },
          uSun: { value: this.sun }, uCloudOffset: { value: 0 }, uCloudsOn: { value: 1 },
          uHeat: { value: 1.0 }, uBump: { value: 0.011 }, uExposure: { value: 1.0 }
        },
        vertexShader: SURFACE_VERT, fragmentShader: EARTH_FRAG
      });
      this.earthMat.extensions = { derivatives: true };
      const earth = this.earth = new THREE.Mesh(new THREE.SphereGeometry(1, 256, 160), this.earthMat);
      earth.renderOrder = 0;
      scene.add(earth);

      // Clouds
      this.cloudMat = new THREE.ShaderMaterial({
        uniforms: { tBrc: { value: tBrc }, uSun: { value: this.sun }, uCloudOffset: { value: 0 }, uOpacity: { value: 0.95 } },
        vertexShader: SURFACE_VERT, fragmentShader: CLOUD_FRAG, transparent: true, depthWrite: false
      });
      this.clouds = new THREE.Mesh(new THREE.SphereGeometry(1.007, 192, 128), this.cloudMat);
      this.clouds.renderOrder = 4;
      scene.add(this.clouds);

      // Atmosphere
      this.atmoMat = new THREE.ShaderMaterial({
        uniforms: { uSun: { value: this.sun }, uThick: { value: 0.07 } },
        vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
        side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.075, 128, 96), this.atmoMat);
      atmo.renderOrder = 10;
      scene.add(atmo);

      this.buildStars();
      this.buildBorders();
      this.buildFires();
      this.buildStorms();
      this.buildMarkers();
      this.bindInput();

      window.addEventListener('resize', () => this.resize());
      this.resize();
      this.renderer.setAnimationLoop(() => this.frame());
      if (this.h.onReady) this.h.onReady();
    },

    /* ---------------- scene pieces ---------------- */

    buildStars() {
      const rand = rng(42), N = 9000;
      const pos = [], size = [], color = [], seed = [];
      const v = new THREE.Vector3();
      const galPole = new THREE.Vector3(0.3, 0.85, -0.4).normalize();
      for (let i = 0; i < N; i++) {
        const band = i < N * 0.45;
        for (;;) {
          v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
          if (v.lengthSq() > 1 || v.lengthSq() < 0.01) continue;
          v.normalize();
          if (band && Math.abs(v.dot(galPole)) > 0.18 * rand()) continue;
          break;
        }
        v.multiplyScalar(900);
        pos.push(v.x, v.y, v.z);
        const m = Math.pow(rand(), band ? 14 : 9);
        size.push(band ? 0.8 + m * 2.5 : 1.0 + m * 4.2);
        const t = rand();
        const c = t < 0.15 ? [0.7, 0.8, 1.0] : t > 0.85 ? [1.0, 0.85, 0.65] : [1.0, 0.97, 0.94];
        const b = band ? 0.35 + m * 0.65 : 0.5 + m * 0.5;
        color.push(c[0] * b, c[1] * b, c[2] * b);
        seed.push(rand());
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
      geo.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
      geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
      this.starMat = new THREE.ShaderMaterial({
        uniforms: { uPR: { value: this.renderer.getPixelRatio() }, uTime: { value: 0 } },
        vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const stars = new THREE.Points(geo, this.starMat);
      stars.renderOrder = -1;
      this.scene.add(stars);
    },

    buildBorders() {
      const topo = window.WORLD_TOPO;
      const mesh = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
      // dark halo underneath + bright core on top = readable on desert, ice and ocean alike
      const geo = thickLineGeometry(mesh.coordinates, 1.0015);
      this.borderHalo = this.makeLine(geo, 0x000000, 1);
      this.borderCore = this.makeLine(geo, 0xffffff, 1);

      // polygons for each data country (focus detection + outline)
      const features = topojson.feature(topo, topo.objects.countries).features;
      const byName = {};
      for (const f of features) byName[f.properties.name] = f;
      this.featuresByName = byName;
      for (const c of window.COUNTRIES) {
        c.polys = [];
        c.rings = [];
        for (const name of c.match) {
          const f = byName[name];
          if (!f) continue;
          const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
          for (const rings of polys) {
            let b = [180, 90, -180, -90];
            for (const [lo, la] of rings[0]) { b = [Math.min(b[0], lo), Math.min(b[1], la), Math.max(b[2], lo), Math.max(b[3], la)]; }
            c.polys.push({ rings, bbox: b });
            c.rings.push(...rings);
          }
        }
      }
      this.outline = null;
    },

    makeLine(geo, color, order) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 },
          uWidth: { value: 1 }, uRes: { value: new THREE.Vector2(1, 1) }
        },
        vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      this.scene.add(mesh);
      (this.lineMats = this.lineMats || []).push(mat);
      if (this.renderer) this.renderer.getDrawingBufferSize(mat.uniforms.uRes.value);
      return { mesh, mat };
    },

    setLine(line, opacity, widthPx) {
      line.mat.uniforms.uOpacity.value = opacity;
      line.mat.uniforms.uWidth.value = widthPx * this.renderer.getPixelRatio();
      line.mesh.visible = opacity > 0.005;
    },

    setOutline(country) {
      this.showOutline(country && country.rings, country && window.HAZARDS[country.hazard].color);
    },

    // outline any countries by map name (used by presentation chapters)
    highlight(names, color) {
      const rings = [];
      for (const n of names) {
        const f = this.featuresByName[n];
        if (!f) continue;
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        for (const p of polys) rings.push(...p);
      }
      this.showOutline(rings, color);
    },

    showOutline(rings, color) {
      if (this.outline) {
        for (const l of [this.outline.halo, this.outline.core]) {
          this.scene.remove(l.mesh); l.mat.dispose();
          this.lineMats.splice(this.lineMats.indexOf(l.mat), 1);
        }
        this.outline.halo.mesh.geometry.dispose();
        this.outline = null;
      }
      if (!rings || !rings.length) return;
      const geo = thickLineGeometry(rings, 1.002);
      this.outline = { halo: this.makeLine(geo, 0x000000, 2), core: this.makeLine(geo, color, 2) };
    },

    isLand(lat, lon) {
      const m = this.landMask;
      const x = Math.floor(((lon + 180) / 360) * m.width) % m.width;
      const y = Math.floor(((90 - lat) / 180) * m.height);
      return m.data[(y * m.width + x) * 4 + 1] > 70;
    },

    buildFires() {
      // Regions with the most satellite-detected active fires (NASA FIRMS climatology).
      // [latMin, latMax, lonMin, lonMax, count]
      const regions = [
        [-15, -4, 13, 34, 420],    // Central/Southern African savanna — most fires on Earth
        [6, 12, -14, 32, 300],     // Sahel / West African savanna
        [-13, -3, -66, -45, 260],  // Amazon "arc of deforestation"
        [-21, -13, -60, -45, 130], // Cerrado & Pantanal
        [57, 67, 105, 140, 170],   // Siberia / Yakutia
        [53, 62, -125, -102, 150], // Western Canada boreal forest
        [49, 54, -79, -70, 60],    // Quebec
        [36, 44, -123, -118, 55],  // California / Oregon
        [-18, -12, 124, 146, 170], // Northern Australian savanna
        [-38, -30, 145, 152, 50],  // South-east Australia
        [16, 23, 94, 106, 140],    // Myanmar / Thailand / Laos
        [-3, 2, 101, 116, 110],    // Sumatra & Borneo peatlands
        [21, 27, 77, 86, 70],      // Central India
        [37, 41, 20, 27, 35],      // Greece / Balkans
        [37, 42, -9, -6, 30],      // Portugal / Spain
        [46, 52, 120, 132, 50]     // NE China / Amur
      ];
      const rand = rng(1234);
      const pos = [], seed = [], size = [];
      const v = new THREE.Vector3();
      for (const [la0, la1, lo0, lo1, count] of regions) {
        const centers = [];
        for (let k = 0; k < Math.ceil(count / 7); k++) {
          for (let tries = 0; tries < 30; tries++) {
            const la = lerp(la0, la1, rand()), lo = lerp(lo0, lo1, rand());
            if (this.isLand(la, lo)) { centers.push([la, lo]); break; }
          }
        }
        if (!centers.length) continue;
        for (let i = 0; i < count; i++) {
          const [cla, clo] = centers[Math.floor(rand() * centers.length)];
          const la = cla + (rand() + rand() - 1) * 0.9, lo = clo + (rand() + rand() - 1) * 1.1;
          if (!this.isLand(la, lo)) continue;
          latLonToVec3(la, lo, 1.0012, v);
          pos.push(v.x, v.y, v.z); seed.push(rand()); size.push(0.006 + Math.pow(rand(), 3) * 0.012);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
      geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
      this.fireMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uScale: { value: 1000 }, uPR: { value: this.renderer.getPixelRatio() }, uSun: { value: this.sun }, uOpacity: { value: 1 } },
        vertexShader: FIRE_VERT, fragmentShader: FIRE_FRAG,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      this.fires = new THREE.Points(geo, this.fireMat);
      this.fires.renderOrder = 3;
      this.scene.add(this.fires);
    },

    buildStorms() {
      const tex = stormTexture();
      // Typical active tropical-cyclone basins; each drifts west and poleward like a real track
      const defs = [
        { lat: 15, lon: 134, size: 0.17, name: 'Typhoon (W. Pacific)' },
        { lat: 22, lon: -66, size: 0.15, name: 'Hurricane (N. Atlantic)' },
        { lat: 14, lon: 88.5, size: 0.12, name: 'Cyclone (Bay of Bengal)' },
        { lat: -16, lon: 64, size: 0.13, name: 'Cyclone (S. Indian Ocean)' },
        { lat: 14, lon: -106, size: 0.12, name: 'Hurricane (E. Pacific)' }
      ];
      this.storms = defs.map((d, i) => {
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            tStorm: { value: tex }, uAngle: { value: i * 1.7 }, uHemi: { value: d.lat >= 0 ? 1 : -1 },
            uOpacity: { value: 1 }, uSun: { value: this.sun }, uNormal: { value: new THREE.Vector3() }
          },
          vertexShader: MARKER_VERT, fragmentShader: STORM_FRAG, transparent: true, depthWrite: false
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(d.size, d.size), mat);
        mesh.renderOrder = 5;
        this.scene.add(mesh);
        return { ...d, lat0: d.lat, lon0: d.lon, mesh, mat, age: (i * 37) % 100 };
      });
    },

    buildMarkers() {
      const geo = new THREE.PlaneGeometry(1, 1);
      this.markers = window.COUNTRIES.map((c, i) => {
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(window.HAZARDS[c.hazard].color) },
            uTime: { value: 0 }, uPhase: { value: (i * 0.137) % 1 }, uActive: { value: 0 }, uFade: { value: 1 }
          },
          vertexShader: MARKER_VERT, fragmentShader: MARKER_FRAG,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(geo, mat);
        const n = latLonToVec3(c.lat, c.lon, 1.0035);
        mesh.position.copy(n);
        mesh.lookAt(n.clone().multiplyScalar(2));
        mesh.renderOrder = 6;
        this.scene.add(mesh);
        return { c, mesh, mat, normal: n.clone().normalize(), active: 0 };
      });
    },

    /* ---------------- camera & input ---------------- */

    resize() {
      const w = window.innerWidth, h = window.innerHeight;
      this.w = w; this.h2 = h;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.fireMat.uniforms.uScale.value = (h * this.renderer.getPixelRatio()) / (2 * Math.tan(FOV * D2R / 2));
      for (const m of this.lineMats) this.renderer.getDrawingBufferSize(m.uniforms.uRes.value);
    },

    touch() { this.lastInteraction = performance.now(); },

    bindInput() {
      const el = this.canvas;
      const pointers = new Map();
      let down = null, pinchStart = null;

      el.addEventListener('pointerdown', e => {
        el.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this.flight = null; this.touch();
        if (pointers.size === 1) {
          down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
          this.vel.lat = this.vel.lon = 0;
        } else if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: this.target.dist };
        }
      });

      el.addEventListener('pointermove', e => {
        const p = pointers.get(e.pointerId);
        if (!p) { this.updateHover(e.clientX, e.clientY); return; }
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        this.touch();
        if (pointers.size === 2 && pinchStart) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          this.target.dist = clamp(1 + (pinchStart.dist - 1) * (pinchStart.d / d), MIN_DIST, MAX_DIST);
          return;
        }
        if (!down) return;
        down.moved += Math.abs(dx) + Math.abs(dy);
        if (down.moved > 4) el.classList.add('dragging');
        const k = 30.7 * (this.view.dist - 1) / this.h2;
        const dLon = -dx * k / Math.max(0.25, Math.cos(this.view.lat * D2R));
        const dLat = dy * k;
        this.target.lon += dLon; this.target.lat = clamp(this.target.lat + dLat, -85, 85);
        this.vel.lon = dLon; this.vel.lat = dLat;
      });

      const up = e => {
        pointers.delete(e.pointerId);
        el.classList.remove('dragging');
        if (pointers.size < 2) pinchStart = null;
        if (down && pointers.size === 0) {
          if (down.moved < 5 && performance.now() - down.t < 500) this.handleClick(e.clientX, e.clientY);
          down = null;
        }
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', () => { if (this.h.onHover) this.h.onHover(null); });

      el.addEventListener('wheel', e => {
        e.preventDefault();
        this.flight = null; this.touch();
        const k = e.ctrlKey ? 0.01 : 0.0016;
        const delta = clamp(e.deltaY * (e.deltaMode === 1 ? 30 : 1), -200, 200);
        this.target.dist = clamp(1 + (this.target.dist - 1) * Math.exp(delta * k), MIN_DIST, MAX_DIST);
      }, { passive: false });
    },

    screenOf(v) {
      const p = v.clone().project(this.camera);
      return { x: (p.x + 1) / 2 * this.w, y: (1 - p.y) / 2 * this.h2, z: p.z };
    },

    facing(normal) {
      return normal.dot(this.camera.position.clone().sub(normal).normalize());
    },

    markerAt(x, y) {
      let best = null, bd = 18;
      for (const m of this.markers) {
        if (this.facing(m.normal) < 0.1) continue;
        const s = this.screenOf(m.mesh.position);
        const d = Math.hypot(s.x - x, s.y - y);
        if (d < bd) { bd = d; best = m.c; }
      }
      return best;
    },

    updateHover(x, y) {
      const c = this.markerAt(x, y);
      this.canvas.classList.toggle('pointer', !!c);
      if (this.h.onHover) this.h.onHover(c, x, y);
    },

    pickLatLon(x, y) {
      const ndc = new THREE.Vector2((x / this.w) * 2 - 1, -(y / this.h2) * 2 + 1);
      const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, this.camera);
      const o = ray.ray.origin, d = ray.ray.direction;
      const b = o.dot(d), c = o.dot(o) - 1, disc = b * b - c;
      if (disc < 0) return null;
      const t = -b - Math.sqrt(disc);
      return vec3ToLatLon(o.clone().add(d.clone().multiplyScalar(t)));
    },

    handleClick(x, y) {
      if (this.chapterMode) return;
      let c = this.markerAt(x, y);
      if (!c) {
        const ll = this.pickLatLon(x, y);
        if (ll) c = this.countryAt(ll.lat, ll.lon, 3);
      }
      if (c && this.h.onSelect) this.h.onSelect(c);
    },

    countryAt(lat, lon, radius) {
      if (lat < -64) return window.COUNTRIES.find(c => c.id === 'antarctica');
      for (const c of window.COUNTRIES) if (c.polys.length && pointInPolys(lon, lat, c.polys)) return c;
      if (lat > 78) return window.COUNTRIES.find(c => c.id === 'arctic');
      let best = null, bd = radius;
      for (const c of window.COUNTRIES) {
        const d = angularDist(lat, lon, c.lat, c.lon);
        if (d < bd) { bd = d; best = c; }
      }
      return best;
    },

    flyTo(c, opts = {}) {
      const toDist = opts.dist || c.zoom || 1.8;
      const toLon = c.lon + 360 * Math.round((this.view.lon - c.lon) / 360);
      const ang = angularDist(this.view.lat, this.view.lon, c.lat, c.lon);
      const d0 = this.view.dist;
      const peak = Math.max(d0, toDist, 1.5 + (ang / 180) * 3.4);
      this.flight = {
        from: { lat: this.view.lat, lon: this.view.lon, dist: d0 },
        to: { lat: c.lat, lon: toLon, dist: toDist },
        ctrl: 2 * peak - (d0 + toDist) / 2,
        start: performance.now(),
        dur: (opts.duration || (1.8 + (ang / 180) * 2.6)) * 1000,
        country: opts.pin === false ? null : c
      };
      this.pinned = opts.pin === false ? null : c;
      this.vel.lat = this.vel.lon = 0;
      this.touch();
    },

    goHome() {
      this.pinned = null;
      this.flight = {
        from: { ...this.view }, to: { lat: clamp(this.view.lat, -10, 25), lon: this.view.lon, dist: HOME_DIST },
        ctrl: Math.max(this.view.dist, HOME_DIST) + 0.3, start: performance.now(), dur: 1600, country: null
      };
      this.flight.ctrl = 2 * this.flight.ctrl - (this.view.dist + HOME_DIST) / 2;
    },

    setLayer(name, on) {
      this.layers[name] = on;
      if (name === 'labels' && this.h.onLabels) this.h.onLabels(on);
    },

    /* ---------------- per-frame ---------------- */

    frame() {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.time += dt;
      const now = performance.now();
      const V = this.view, T = this.target;

      if (this.flight) {
        const f = this.flight;
        const t = clamp((now - f.start) / f.dur, 0, 1), e = easeInOut(t);
        V.lat = lerp(f.from.lat, f.to.lat, e);
        V.lon = lerp(f.from.lon, f.to.lon, e);
        const u = 1 - e;
        V.dist = u * u * f.from.dist + 2 * u * e * f.ctrl + e * e * f.to.dist;
        T.lat = V.lat; T.lon = V.lon; T.dist = V.dist;
        if (t >= 1) { this.flight = null; if (f.country && this.h.onArrive) this.h.onArrive(f.country); }
      } else {
        const dragging = this.canvas.classList.contains('dragging');
        if (!dragging) {
          T.lon += this.vel.lon; T.lat = clamp(T.lat + this.vel.lat, -85, 85);
          const decay = Math.pow(0.05, dt);
          this.vel.lon *= decay; this.vel.lat *= decay;
        }
        const idle = now - this.lastInteraction > 5000;
        if (this.autoRotate && idle && !this.pinned && V.dist > FOCUS_DIST) T.lon -= dt * 4.5;
        const k = 1 - Math.exp(-dt * 9), kd = 1 - Math.exp(-dt * 6);
        V.lat += (T.lat - V.lat) * k;
        V.lon += (T.lon - V.lon) * k;
        V.dist += (T.dist - V.dist) * kd;
      }

      // Camera: straight down when far, gently tilted toward the horizon when close
      const zf = smoothstep(2.7, 1.3, V.dist);
      const tilt = 11 * zf;
      latLonToVec3(clamp(V.lat - tilt, -89, 89), V.lon, V.dist, this.camera.position);
      const look = latLonToVec3(V.lat, V.lon, zf);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(look);

      this.panelShift += (this.panelShiftTarget - this.panelShift) * (1 - Math.exp(-dt * 6));
      if (Math.abs(this.panelShift) > 0.5) this.camera.setViewOffset(this.w, this.h2, this.panelShift, 0, this.w, this.h2);
      else this.camera.clearViewOffset();
      this.camera.updateMatrixWorld();

      // Sun
      if (this.layers.realsun) {
        const s = subsolarPoint(new Date());
        latLonToVec3(s.lat, s.lon, 1, this.sun);
      } else {
        latLonToVec3(clamp(V.lat + lerp(22, 14, zf), -80, 80), V.lon + lerp(62, 26, zf), 1, this.sun);
      }

      // Uniforms & layers
      this.cloudOffset = (this.cloudOffset + dt * 0.0016) % 1;
      const heatTarget = this.layers.heat ? lerp(1.0, 0.28, zf) * (this.focus ? 0.6 : 1) : 0;
      const em = this.earthMat.uniforms;
      em.uHeat.value += (heatTarget - em.uHeat.value) * (1 - Math.exp(-dt * 4));
      em.uCloudOffset.value = this.cloudOffset;
      em.uCloudsOn.value += ((this.layers.clouds ? 1 : 0) - em.uCloudsOn.value) * (1 - Math.exp(-dt * 4));
      const cm = this.cloudMat.uniforms;
      cm.uCloudOffset.value = this.cloudOffset;
      cm.uOpacity.value = em.uCloudsOn.value * (0.95 - em.uHeat.value * 0.45) * lerp(1, 0.7, zf);
      this.clouds.visible = cm.uOpacity.value > 0.01;

      const fu = this.fireMat.uniforms;
      fu.uTime.value = this.time;
      fu.uOpacity.value += ((this.layers.fires ? 1 : 0) - fu.uOpacity.value) * (1 - Math.exp(-dt * 4));
      this.fires.visible = fu.uOpacity.value > 0.01;
      this.starMat.uniforms.uTime.value = this.time;

      // Storms: spin + drift
      const stormOn = this.layers.storms ? 1 : 0;
      for (const s of this.storms) {
        s.age += dt;
        const life = 90, a = (s.age % life) / life;
        s.lat = s.lat0 + Math.sign(s.lat0) * a * 9;
        s.lon = s.lon0 - a * 14;
        const n = latLonToVec3(s.lat, s.lon, 1.0095);
        s.mesh.position.copy(n);
        s.mesh.lookAt(n.clone().multiplyScalar(2));
        s.mat.uniforms.uNormal.value.copy(n).normalize();
        s.mat.uniforms.uAngle.value += dt * 0.35;
        const fade = smoothstep(0, 0.08, a) * (1 - smoothstep(0.88, 1, a));
        const u = s.mat.uniforms.uOpacity;
        u.value += (stormOn * fade - u.value) * (1 - Math.exp(-dt * 5));
        s.mesh.visible = u.value > 0.01;
      }

      // Markers scale with distance so they stay a similar size on screen
      const ms = 0.05 * (V.dist - 0.92);
      for (const m of this.markers) {
        const isActive = this.focus === m.c ? 1 : 0;
        m.active += (isActive - m.active) * (1 - Math.exp(-dt * 6));
        m.mesh.scale.setScalar(ms * (1 + m.active * 0.35));
        m.mat.uniforms.uTime.value = this.time;
        m.mat.uniforms.uActive.value = m.active;
      }

      const labelsOn = this.layers.labels ? 1 : 0;
      const near = smoothstep(3.6, 1.5, V.dist);
      this.setLine(this.borderHalo, labelsOn * lerp(0.3, 0.6, near), lerp(3, 4.5, near));
      this.setLine(this.borderCore, labelsOn * lerp(0.45, 0.95, near), lerp(1.1, 1.8, near));
      if (this.outline) {
        const show = this.chapterMode ? 1 : smoothstep(FOCUS_DIST + 0.2, FOCUS_DIST - 0.3, V.dist);
        this.setLine(this.outline.halo, show * 0.7, 6.5);
        this.setLine(this.outline.core, show * (0.85 + 0.15 * Math.sin(this.time * 2.5)), 3);
      }

      // Focus detection
      this.detectFocus();

      if (this.h.onFrame) this.h.onFrame(this);
      this.renderer.render(this.scene, this.camera);
    },

    detectFocus() {
      // presentation chapters control the view and outline themselves
      if (this.chapterMode) {
        if (this.focus) { this.focus = null; if (this.h.onFocus) this.h.onFocus(null); }
        return;
      }
      const V = this.view;
      let c = null;
      if (this.pinned) {
        const d = angularDist(V.lat, V.lon, this.pinned.lat, this.pinned.lon);
        if (this.flight || (d < 14 && V.dist < FOCUS_DIST + 0.5)) c = this.flight ? (this.flight.country && performance.now() - this.flight.start > this.flight.dur * 0.6 ? this.pinned : this.focus) : this.pinned;
        else this.pinned = null;
      }
      if (!this.pinned && V.dist < FOCUS_DIST) {
        c = this.countryAt(V.lat, wrapLon(V.lon), 3 + (V.dist - 1.1) * 5);
      }
      if (c !== this.focus) {
        this.focus = c;
        this.setOutline(c);
        if (this.h.onFocus) this.h.onFocus(c);
      }
    },

    setPanelShift(px) { this.panelShiftTarget = px; }
  };

  window.Globe = Globe;
})();
