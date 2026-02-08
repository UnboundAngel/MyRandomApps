import React, { useEffect, useRef } from 'react';

export const AtmosphereShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // --- SHADER SOURCES ---
    const vertShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Note: Converted generic GLSL logic to fit specific mist effect
    const fragShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // --- NOISE FUNCTIONS ---
      float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) +
                  (c - a)* u.y * (1.0 - u.x) +
                  (d - b) * u.x * u.y;
      }

      #define OCTAVES 5
      float fbm (in vec2 st) {
          float value = 0.0;
          float amplitude = .5;
          float frequency = 0.0;
          
          for (int i = 0; i < OCTAVES; i++) {
              value += amplitude * noise(st);
              st *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;

          // Mist movement
          vec2 q = vec2(0.);
          q.x = fbm( uv + 0.05 * u_time);
          q.y = fbm( uv + vec2(1.0));

          vec2 r = vec2(0.);
          r.x = fbm( uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time );
          r.y = fbm( uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

          float f = fbm(uv + r);

          // Colors: Deep Tangled Purple -> Magic Pink -> Gold Highlights
          vec3 c1 = vec3(0.29, 0.0, 0.51); // Dark Purple
          vec3 c2 = vec3(0.8, 0.4, 0.7);   // Pink/Magenta
          vec3 c3 = vec3(1.0, 0.8, 0.4);   // Gold

          vec3 color = mix(c1, c2, smoothstep(0.2, 0.6, f));
          color = mix(color, c3, smoothstep(0.7, 1.0, f));

          // Vignette
          vec2 center = gl_FragCoord.xy / u_resolution.xy - 0.5;
          center.x *= u_resolution.x / u_resolution.y;
          float vignette = 1.0 - smoothstep(0.3, 1.5, length(center));

          // Transparency - keeping it wispy
          float alpha = smoothstep(0.2, 0.9, f) * 0.4; 

          // Output
          gl_FragColor = vec4(color * vignette, alpha);
      }
    `;

    // --- WEBGL SETUP ---
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(vertShaderSource, gl.VERTEX_SHADER);
    const fragShader = compileShader(fragShaderSource, gl.FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttrib = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    let startTime = performance.now();
    let frameId: number;

    const render = () => {
      if (!canvas) return;
      // Handle resize dynamically
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      if (resolutionLocation) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      if (timeLocation) gl.uniform1f(timeLocation, (performance.now() - startTime) * 0.0005);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Additive/Screen blending for magical glow effect
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10 opacity-60" />;
};