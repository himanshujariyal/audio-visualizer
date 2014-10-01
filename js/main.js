

  var AudioAnalyser, COLORS, MP3_PATH, NUM_BANDS, NUM_PARTICLES, Particle;

  NUM_PARTICLES = 256;

  NUM_BANDS = 256;

  SMOOTHING = 0.55;

  MP3_PATH = ['http://www.woo55.pk/adata/13890/Chris%20Brown%20-%20X%20(www.SongsLover.pk).mp3'];


  COLORS = [['#69D2E7', '#1B676B', '#BEF202', '#EBE54D', '#00CDAC', '#1693A5','#F9D423', '#FF4E50', '#E7204E', '#0CCABA', '#FF006F'],
            ['#1A4F63', '#068F86', '#6FD57F', '#FCB03C', '#FC5B3F', '#1693A5','#F9D423', '#FF4E50', '#E7204E', '#0CCABA', '#FF006F'] 
           ];


  AudioAnalyser = (function() {
    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

    AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

    function AudioAnalyser(audio, numBands, smoothing) {
      var src;
      this.audio = audio != null ? audio : new Audio();
      this.numBands = numBands != null ? numBands : 256;
      this.smoothing = smoothing != null ? smoothing : 0.5;
      if (typeof this.audio === 'string') {
        src = this.audio;
        this.audio = new Audio();
        this.audio.controls = true;
        this.audio.src = src;
      }
      this.context = new AudioAnalyser.AudioContext();
      this.jsNode = this.context.createScriptProcessor(2048, 1, 1);
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = this.smoothing;
      this.analyser.fftSize = this.numBands;
      this.bands = new Uint8Array(this.analyser.frequencyBinCount);
      this.audio.addEventListener('canplay', (function(_this) {
        return function() {
          _this.source = _this.context.createMediaElementSource(_this.audio);
          _this.source.connect(_this.analyser);
          _this.analyser.connect(_this.jsNode);
          _this.jsNode.connect(_this.context.destination);
          _this.source.connect(_this.context.destination);
          return _this.jsNode.onaudioprocess = function() {
            _this.analyser.getByteFrequencyData(_this.bands);
            if (!_this.audio.paused) {
              return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
            }
          };
        };
      })(this));
    }

    AudioAnalyser.prototype.start = function() {
      return this.audio.play();
    };

    AudioAnalyser.prototype.stop = function() {
      return this.audio.pause();
    };

    return AudioAnalyser;

  })();

  
  Particle = (function() {

    function Particle(x, y,banded) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.band = banded;
      this.reset();
    }

    Particle.prototype.reset = function() {
      this.width = 10;
      this.color = random(COLORS[1]);
      return this.energy = 0.0;
    };

    Particle.prototype.draw = function(ctx) {
      this.himanshu = this.energy * 100;
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -this.himanshu);
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      return ctx.restore();
    };

    return Particle;

  })();

  var heights =  document.getElementById( 'musicbar' ).offsetHeight;
  var widths =  document.getElementById( 'musicbar' ).offsetWidth;

  Sketch.create({
    fullscreen: false,
    width:widths,
    height:heights,
    container: document.getElementById( 'musicbar' ),
    particles: [],
    setup: function() {
      var analyser, error, i, particle, x, y, _i, _ref;
      for (i = _i = 0, _ref = NUM_PARTICLES - 1; _i <= _ref; i = _i += 1) {
        x = i*6;
        y = this.height;
        particle = new Particle(x, y, i);
        particle.energy = random(particle.band / 256);
        this.particles.push(particle);
      }
      if (AudioAnalyser.enabled) {
        try {
          analyser = new AudioAnalyser(MP3_PATH[floor(random(2))], NUM_BANDS, SMOOTHING);
          analyser.onUpdate = (function(_this) {
            return function(bands) {
              var _j, _len, _ref1, _results;
              _ref1 = _this.particles;
              _results = [];
              for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                particle = _ref1[_j];
                particle.energy = bands[particle.band] / 512;
                _results.push(particle.energy = bands[particle.band] / 512);
              }
              return _results;
            };
          })(this);
          analyser.start();
          document.body.appendChild(analyser.audio);
          if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            console.log("Safari");
          }
        } catch (error) {
        }
      } else {
        console.log("AudioAnalyser Disabled");
      }
    },
    draw: function() {
      var particle, _i, _len, _ref, _results;
      this.globalCompositeOperation = 'lighter';
      _ref = this.particles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        particle = _ref[_i];
        _results.push(particle.draw(this));
      }
      return _results;
    }
  });



