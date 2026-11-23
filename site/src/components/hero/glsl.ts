/* ------------------------------------------------------------------------ */
/* GLSL helpers                                                             */
/* ------------------------------------------------------------------------ */

/* 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) */
export const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/**
 * Shared choreography for point-based shapes:
 *  assemble() — particles fly in from a scattered cloud, staggered,
 *               and blow outwards again as the hero scrolls away.
 */
export const choreographyGLSL = /* glsl */ `
uniform float uIntro;
uniform float uScroll;
uniform float uEnergy;
uniform float uPixelRatio;

vec3 hash3(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.xxy + p.yzz) * p.zyx) * 2.0 - 1.0;
}

float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

/* 0..1 progress of this particle's flight; stagger in 0..1 delays it */
float arrival(float stagger) {
  return easeOutCubic(clamp(uIntro * 1.6 - stagger * 0.6, 0.0, 1.0));
}

vec3 assemble(vec3 p, vec3 seed, float stagger) {
  float k = arrival(stagger);
  vec3 h = hash3(seed);
  vec3 scatter = normalize(h + 0.0001) * (2.4 + hash3(seed * 1.7).x * 1.4);
  vec3 q = mix(scatter, p, k);
  // scroll exit: burst outwards with a little turbulence
  float s = uScroll * uScroll;
  q += normalize(p + 0.0001) * s * 2.4 + hash3(seed * 3.1) * s * 1.2;
  return q;
}

float exitFade() { return 1.0 - smoothstep(0.05, 0.8, uScroll); }
`;

/** Shared soft round sprite for point-based shapes */
export const pointFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  varying float vMix;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 color = mix(uAccent, uAccent2, vMix);
    // hot white core on bright points
    color += vec3(1.0) * smoothstep(0.25, 0.0, r) * clamp(vAlpha, 0.0, 1.0) * 0.4;
    gl_FragColor = vec4(color, soft * vAlpha);
  }
`;
