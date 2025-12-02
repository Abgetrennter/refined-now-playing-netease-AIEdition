// 拦截 HTMLImageElement 的 src 属性
// intercept src setter of HTMLImageElement
export const initImageSrcInterceptor = () => {
    const _src = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (_src) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            get: function() {
                return _src.get?.call(this);
            },
            set: function(src) {
                let element = this;
                if (element.classList.contains('j-flag')/* || (element.parentElement && element.parentElement.classList.contains('.j-curr'))*/) {
                    if (!window.albumSize) {
                        window.albumSize = 210;
                    }
                    src = src.replace(/thumbnail=\d+y\d+/g, `thumbnail=${window.albumSize}y${window.albumSize}`);
                    if (src.startsWith('data:image/gif;')) {
                        src = 'orpheus://cache/?https://p1.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg';
                    }
                }
                return _src.set?.call(this, src);
            }
        });
    }
}
