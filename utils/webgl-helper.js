const random = Math.random;
// 获取随机颜色
function randomColor() {
  return {
    r: random() * 255,
    g: random() * 255,
    b: random() * 255,
    a: random() * 1
  };
}

// 获取 DOM 标签
function $$(str) {
  if (!str) return null;
  if (str.startsWith('#')) {
    return document.querySelector(str);
  }
  let result = document.querySelectorAll(str);
  if (result.length == 1) {
    return result[0];
  }
  return result;
}

// 获取canvas
function getCanvas(id) {
  return $$(id);
}

// 重置 canvas 大小
function resizeCanvas(canvas, width, height) {
  if (canvas.width !== width) {
    canvas.width = width ? width : window.innerWidth;
  }
  if (canvas.height !== height) {
    canvas.height = height ? height : window.innerHeight;
  }
}

// 创建 webgl
function getContext(canvas) {
  return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
}

// 创建着色器
function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  //检测是否编译正常。
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// 添加着色器
function createShaderFromScript(gl, type, scriptId) {
  let sourceScript = $$('#' + scriptId);
  if (!sourceScript) {
    return null;
  }
  return createShader(gl, type, sourceScript.innerHTML);
}

// 创建程序
function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  vertexShader && gl.attachShader(program, vertexShader);
  fragmentShader && gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let result = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (result) {
    console.log('着色器程序创建成功');
    let uniformSetters = createUniformSetters(gl, program);
    let attributeSetters = createAttributeSetters(gl, program);
    return {
      program: program,
      uniformSetters: uniformSetters,
      attributeSetters: attributeSetters
    };
    return program;
  }
  let errorLog = gl.getProgramInfoLog(program);
  gl.deleteProgram(program);
  throw errorLog;
}
// 创建简单的着色器程序
function createSimpleProgram(gl, vertexShader, fragmentShader) {
  if (!vertexShader || !fragmentShader) {
    console.warn('着色器不能为空');
    return;
  }
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
function createSimpleProgramFromScript(gl, vertexScriptId, fragmentScriptId) {
  let vertexShader = createShaderFromScript(
    gl,
    gl.VERTEX_SHADER,
    vertexScriptId
  );
  let fragmentShader = createShaderFromScript(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentScriptId
  );
  let program = createSimpleProgram(gl, vertexShader, fragmentShader);
  return program;
}

function createBuffer(gl, attribute, vertexAttribPointer) {
  let {size, type, normalize, stride, offset} = vertexAttribPointer;
  gl.enableVertexAttribArray(attribute);
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    attribute,
    size,
    type || gl.FLOAT,
    normalize || false,
    stride || 0,
    offset || 0
  );
  return buffer;
}

function createProgramFromScript(gl, vertexScriptId, fragmentScriptId) {
  let vertexShader = createShaderFromScript(
    gl,
    gl.VERTEX_SHADER,
    vertexScriptId
  );
  let fragmentShader = createShaderFromScript(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentScriptId
  );
  let program = createSimpleProgram(gl, vertexShader, fragmentShader);
  return program;
}

function loadTexture(gl, src, attribute, callback) {
  let img = new Image();
  img.crossOrigin = 'anonymous'; //无效
  img.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(attribute, 0);
    callback && callback();
  };
  img.src = src;
}

function createColorForVertex(vertex, c) {
  let vertexNums = vertex.positions;
  let colors = [];
  let color = c || {
    r: 255,
    g: 0,
    b: 0,
    a: 255
  };

  for (let i = 0; i < vertexNums.length; i++) {
    color = c || randomColor();
    colors.push(color.r, color.g, color.b, 255);
  }

  vertex.colors = new Uint8Array(colors);
  return vertex;
}
