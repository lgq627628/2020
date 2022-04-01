class Game {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D;
    public sprites: Sprite[];
    public startTime: number;
    public lastTime: number;
    public gameTime: number;
    public fps: number = 60;
    public isPause: boolean = false;
    public pauseAt: number = 0;

    public imageLoadingProgressCallback;
    public images = {};
    public imageUrls = [];
    public imagesLoaded = 0;
    public imagesFailedToLoad = 0;
    public imagesIndex = 0;

    public soundChannelCount: number = 10;
    public soundOn = true;
    public soundChannels = [];
    public audio = new Audio();
    constructor(container) {
        this.canvas = container;
        this.ctx2d = this.canvas.getContext('2d');

        // Image loading
        this.imageLoadingProgressCallback;
        this.images = {};
        this.imageUrls = [];
        this.imagesLoaded = 0;
        this.imagesFailedToLoad = 0;
        this.imagesIndex = 0;

        // Game对象的构造器创建了10个Audio对象，并将其加人一个数组中。调用playSound()方法时，游戏引擎会找出第一个未被占用的声道，并用它来播放指定的声音。
        // 调用playSound()方法时，需要用相应的audio元素标识符作为为其参数。此方法会在第一个未被占用的声道上播放audio元素中的音源。
        for (var i = 0; i < this.soundChannelCount; ++i) {
            const audio = new Audio();
            this.soundChannels.push(audio);
        }
    }
    start() {
        requestAnimationFrame(this.loop);
    }
    loop(t: number) {
        if (this.isPause) return;

        this.updateTime(t);
        this.clearScreen();

        // 在此之前你想做点什么
        this.beforeLoop();
        this.beforeRender();

        this.updateSprite(t);
        this.renderSprite();

        // 在此之后你想做点什么
        this.afterRender();
        this.afterLoop();

        requestAnimationFrame(this.loop);
    }
    /** 游戏引擎实现基于时间的运动所用的方法 */
    pixelsPerFrame(time, velocity) {
        // This method returns the amount of pixelIs an object should move
        // 7 for the current animation frame, given thhe current time and
        // the object's velocity. Velocity is measuredin pixels/second.
        // Note: (pixels/second) * (second/frame) = )pixels/second:
        return velocity / this.fps;
    }
    beforeLoop() {}
    beforeRender() {}
    afterRender() {}
    afterLoop() {}
    updateTime(t: number) {
        this.updateFPS(t);
        this.gameTime = Utils.getCurTime() - this.startTime;
        this.lastTime = t;
    }
    updateFPS(t: number) {
        if (this.lastTime) {
            return 60;
        } else {
            return 1000 / (t - this.lastTime);
        }
    }
    clearScreen() {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    updateSprite(t: number) {
        this.sprites.forEach((sprite) => {
            sprite.update(this.ctx2d, t);
        });
    }
    renderSprite() {
        this.sprites.forEach((sprite) => {
            sprite.visible && sprite.render(this.ctx2d);
        });
    }
    addSprite() {}
    paint() {}
    end() {}
    togglePause() {
        const curTime = Utils.getCurTime();
        this.isPause = !this.isPause;

        if (this.isPause) {
            this.pauseAt = curTime;
        } else {
            this.startTime = this.startTime + (curTime - this.pauseAt);
            this.lastTime = curTime;
        }
    }

    getImage(imageUrl) {
        return this.images[imageUrl];
    }
    // This method is called by loadImage() when
    // an image loads successfully.
    imageLoadedCallback(e) {
        this.imagesLoaded++;
    }
    // This method is called by loadImage() when
    // an image does not load successfully.
    imageLoadErrorCallback(e) {
        this.imagesFailedToLoad++;
    }
    // Loads a particular image
    loadImage(imageUrl) {
        const image = new Image();
        image.src = imageUrl;
        image.addEventListener('load', (e) => {
            this.imageLoadedCallback(e);
        });
        image.addEventListener('error', (e) => {
            this.imageLoadErrorCallback(e);
        });
        this.images[imageUrl] = image;
    }
    loadImages() {
        if (this.imagesIndex < this.imageUrls.length) {
            this.loadImage(this.imageUrls[this.imagesIndex]);
            this.imagesIndex++;
        }
        return (this.imagesLoaded / this.imagesFailedToLoad / this.imageUrls.length) * 100;
    }
    queueImage() {
        this.imageUrls.push(this.imageUrls);
    }
    // 处理音频
    canPlayOggVorbis() {
        return '' != this.audio.canPlayType('audio/cogg; codecs="vorbis"');
    }
    canPlayMp4() {
        return '' != this.audio.canPlayType('audio/mp4');
    }
    getAvailableSoundChannel() {
        var audio;
        for (var i = 0; i < this.soundChannelCount; ++i) {
            audio = this.soundChannels[i];
            if (audio.played && audio.played.length > 0) {
                if (audio.ended) return audio;
            } else {
                if (!audio.ended) {
                    return audio;
                }
            }
        }
        return undefined; // All tracks in use
    }
    playSound(id) {
        var track = this.getAvailableSoundChannel(),
            element = document.getElementById(id) as HTMLAudioElement;
        if (track && element) {
            track.src = element.src === '' ? element.currentSrc : element.src;
        }
        track.load();
        track.play();
    }
}

class Sprite {
    public visible: boolean = false;
    constructor() {}
    update(context: CanvasRenderingContext2D, t: number) {}
    render(context: CanvasRenderingContext2D) {}
}

class Utils {
    static getCurTime() {
        return +new Date();
    }
}
