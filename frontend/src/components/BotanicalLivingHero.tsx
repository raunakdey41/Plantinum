"use client";

import React, { useEffect, useRef, useState } from 'react';

interface BotanicalLivingHeroProps {
  imageSrc: string;
  altText: string;
}

export default function BotanicalLivingHero({ imageSrc, altText }: BotanicalLivingHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'low-power'
    });

    if (!gl) {
      // Fallback gracefully to static image
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y; // Flip Y for WebGL texture coordinate system
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader with precise micro-movement physics on isolated leaf blades only
    const fsSource = `
      precision highp float;

      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform vec2 u_image_resolution;
      uniform float u_time;

      varying vec2 v_uv;

      // Smooth C1-continuous Hermite falloff: exactly 1.0 at center, 0.0 at radius
      float leafWeight(vec2 p, vec2 center, float radius) {
        float d = distance(p, center);
        if (d >= radius) return 0.0;
        float x = d / radius;
        float w = 1.0 - x * x;
        return w * w;
      }

      void main() {
        // Precise object-fit: cover, object-position: bottom aspect ratio mapping
        float canvasAspect = u_resolution.x / u_resolution.y;
        float imageAspect = u_image_resolution.x / u_image_resolution.y;

        vec2 imgUV;
        if (canvasAspect > imageAspect) {
          float scale = imageAspect / canvasAspect;
          imgUV.x = v_uv.x;
          imgUV.y = 1.0 - (1.0 - v_uv.y) * scale;
        } else {
          float scale = canvasAspect / imageAspect;
          imgUV.x = 0.5 + (v_uv.x - 0.5) * scale;
          imgUV.y = v_uv.y;
        }

        if (imgUV.x < 0.0 || imgUV.x > 1.0 || imgUV.y < 0.0 || imgUV.y > 1.0) {
          gl_FragColor = vec4(0.094, 0.176, 0.129, 1.0); // #182d21 background
          return;
        }

        vec2 p = imgUV * u_image_resolution;
        vec2 offset = vec2(0.0);

        // HARD SAFETY BOUNDARY:
        // Tabletop, pots, contact shadows, soil, and left UI text column
        // are 100% mathematically locked and completely static.
        if (p.y < 530.0 && p.x > 450.0) {

          // Leaf 1: Hanging Pothos Low Left Leaf (550, 475)
          // Cycle: 23.4s, secondary harmonic: 14.1s | Max deflection: 1.3px
          {
            float w = leafWeight(p, vec2(550.0, 475.0), 28.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2685 + 0.5) + 0.3 * sin(u_time * 0.445 + 1.2);
              vec2 dir = vec2(cos(0.35), sin(0.35) * 0.35);
              offset += dir * (wave * 1.3 * w);
            }
          }

          // Leaf 2: Hanging Pothos Mid Left Leaf (595, 345)
          // Cycle: 27.8s, secondary harmonic: 16.7s | Max deflection: 1.2px
          {
            float w = leafWeight(p, vec2(595.0, 345.0), 26.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2260 + 2.1) + 0.35 * sin(u_time * 0.376 + 0.8);
              vec2 dir = vec2(cos(-0.4), sin(-0.4) * 0.3);
              offset += dir * (wave * 1.2 * w);
            }
          }

          // Leaf 3: Hanging Pothos Upper Right Leaf (605, 270)
          // Cycle: 21.2s, secondary harmonic: 12.8s | Max deflection: 1.1px
          {
            float w = leafWeight(p, vec2(605.0, 270.0), 28.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2963 + 4.3) + 0.25 * sin(u_time * 0.490 + 3.1);
              vec2 dir = vec2(cos(0.6), sin(0.6) * 0.3);
              offset += dir * (wave * 1.1 * w);
            }
          }

          // Leaf 4: Fiddle Leaf Fig Top Leaf Blade (805, 265)
          // Cycle: 31.5s, secondary harmonic: 18.2s (very gentle broad-leaf flex) | Max deflection: 1.0px
          {
            float w = leafWeight(p, vec2(805.0, 265.0), 30.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.1994 + 1.7) + 0.3 * sin(u_time * 0.345 + 2.4);
              vec2 dir = vec2(cos(-0.25), sin(-0.25) * 0.25);
              offset += dir * (wave * 1.0 * w);
            }
          }

          // Leaf 5: Hanging Ivy Left Tendril (935, 320)
          // Cycle: 25.1s, secondary harmonic: 15.3s | Max deflection: 1.4px
          {
            float w = leafWeight(p, vec2(935.0, 320.0), 24.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2503 + 3.6) + 0.35 * sin(u_time * 0.410 + 1.9);
              vec2 dir = vec2(cos(0.5), sin(0.5) * 0.35);
              offset += dir * (wave * 1.4 * w);
            }
          }

          // Leaf 6: Hanging Ivy Mid Tendril (1070, 280)
          // Cycle: 29.4s, secondary harmonic: 17.6s | Max deflection: 1.2px
          {
            float w = leafWeight(p, vec2(1070.0, 280.0), 24.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2137 + 5.2) + 0.3 * sin(u_time * 0.357 + 4.1);
              vec2 dir = vec2(cos(-0.5), sin(-0.5) * 0.3);
              offset += dir * (wave * 1.2 * w);
            }
          }

          // Leaf 7: ZZ Plant Upper Leaflet (1240, 350)
          // Cycle: 26.3s, secondary harmonic: 15.9s | Max deflection: 0.9px
          {
            float w = leafWeight(p, vec2(1240.0, 350.0), 24.0);
            if (w > 0.0) {
              float wave = sin(u_time * 0.2389 + 0.9) + 0.3 * sin(u_time * 0.395 + 5.0);
              vec2 dir = vec2(cos(0.2), sin(0.2) * 0.25);
              offset += dir * (wave * 0.9 * w);
            }
          }
        }

        // Subpixel bilinear displacement sampling
        vec2 sampleUV = (p + offset) / u_image_resolution;
        vec4 color = texture2D(u_image, sampleUV);

        // Match original contrast-105 brightness-95 styling exactly
        vec3 filtered = ((color.rgb - 0.5) * 1.05 + 0.5) * 0.95;
        gl_FragColor = vec4(filtered, 1.0);
      }
    `;

    // Compile shader helper
    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    // Quad geometry covering the full screen [-1, -1] to [1, 1]
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, 'a_position');
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uImageResolutionLoc = gl.getUniformLocation(program, 'u_image_resolution');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uImageLoc = gl.getUniformLocation(program, 'u_image');

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let animationFrameId: number;
    let isRunning = true;
    const startTime = performance.now();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      if (!isRunning) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      const resize = () => {
        if (!container || !canvas) return;
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      };

      resize();
      window.addEventListener('resize', resize);
      setIsReady(true);

      const render = () => {
        if (!isRunning) return;
        const rect = container.getBoundingClientRect();
        const elapsed = (performance.now() - startTime) / 1000.0;

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(uResolutionLoc, rect.width, rect.height);
        gl.uniform2f(uImageResolutionLoc, img.naturalWidth || 1376.0, img.naturalHeight || 768.0);
        gl.uniform1f(uTimeLoc, elapsed);
        gl.uniform1i(uImageLoc, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationFrameId = requestAnimationFrame(render);
      };

      render();
    };

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', () => {});
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    };
  }, [imageSrc]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden flex items-end justify-center">
      {/* Pristine base image is always loaded and rendered instantly */}
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover object-bottom filter contrast-105 brightness-95"
      />

      {/* GPU WebGL layer with imperceptible leaf-only micro-motion */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
