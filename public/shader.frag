#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
vec2 hash( vec2 x )
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 1.456*fract( sin(u_time*0.088 )* k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

void main( )
{

    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    vec2 r = vec2(gl_FragCoord.xy  - 0.5*u_resolution.xy );

	r = 1.5 * r.xy / u_resolution.xy;
    float colorwave=sin(.5 * u_time)*4.0;
    vec3 col1 = vec3 (0.76,0.26,0.15);
    vec3 col2 = vec3 (0.0,0.0,0.0);
    vec3 col3 = vec3 (0.4,0.1,.3);
    vec3 col4 = vec3 (0.1,0.1,.2*colorwave);

    vec3 pixi;
    float n = noise(1.*uv);
    float nn = noise(2.*uv*n);
    float width = length(r*sin(cos(.1 * u_time))/nn);

    float width2 = length(r*cos(sin(.1 * u_time))-nn);
    float mody = length(r/dot(width*width2,sin(cos(r.x+u_time*.01)*0.3)));
    float mody2 = length(r*dot(width/width2,sin(cos(r.y+u_time*.5)*.3)));
    if(tan(sin(u_time+length(r)*.2))*r.y*n> distance( mody,mody2)){

        pixi = col1;
    	}
      else{(pixi = col2);
      }
    gl_FragColor  = vec4(pixi,0.3);
}