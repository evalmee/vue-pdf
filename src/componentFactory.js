import resizeSensor from 'vue-resize-sensor'

export default function(pdfjsWrapper) {

	var createLoadingTask = pdfjsWrapper.createLoadingTask;
	var PDFJSWrapper = pdfjsWrapper.PDFJSWrapper;

	return {
		createLoadingTask: createLoadingTask,
		render: function(h) {
			return h('div', {
				attrs: {
					style: 'position: relative'
				}
			}, [
				h('div', {
					ref: 'canvasParent'
				}, [

				]),
				h('div', {
					class: 'annotationLayer',
					ref:'annotationLayer'
				}),
				h(resizeSensor, {
					props: {
						initial: true
					},
					on: {
						resize: this.resize
					},
				})
			])
		},
		props: {
			src: {
				type: [String, Object],
				default: '',
			},
			page: {
				type: Number,
				default: 1,
			},
			rotate: {
				type: Number,
				default: 0,
			},
			height: {
				type: String,
				default: null,
			},
			width: {
				type: String,
				default: null,
			},
			maxHeight: {
				type: String,
				default: null,
			},
			maxWidth: {
				type: String,
				default: null,
			},
			display: {
				type: String,
				default: null,
			},
		},
		watch: {
			src: function() {

				this.pdf.loadDocument(this.src);
			},
			page: function() {

				this.pdf.loadPage(this.page, this.rotate);
			},
			rotate: function() {
				this.pdf.renderPage(this.rotate);
			},
		},
		methods: {
			resize: function(size) {

				// check if the element is attached to the dom tree || resizeSensor being destroyed
				if ( this.$el.parentNode === null || (size.width === 0 && size.height === 0) )
					return;

				// on IE10- canvas height must be set
				!this.height && !this.width && this.pdf.setCanvasHeight(this.pdf.getCanvas().offsetWidth * (this.pdf.getCanvas().height / this.pdf.getCanvas().width) + 'px');
				// update the page when the resolution is too poor
				var resolutionScale = this.pdf.getResolutionScale();

				if ( resolutionScale < 0.85 || resolutionScale > 1.15 )
				{
					this.pdf.renderPage(this.rotate);
				}


				this.$refs.annotationLayer.style.transform = 'scale('+resolutionScale+')';
			},
			print: function(dpi, pageList) {

				this.pdf.printPage(dpi, pageList);
			}
		},

		// doc: mounted hook is not called during server-side rendering.
		mounted: function() {

			this.pdf = new PDFJSWrapper(
				this.$refs.canvasParent,
				this.$refs.annotationLayer,
				this.$emit.bind(this),
				this.width,
				this.height,
				this.maxWidth,
				this.maxHeight,
				this.display
				);

			this.$on('loaded', function() {

				this.pdf.loadPage(this.page, this.rotate);
				this.pdf.loadPage(this.page, this.rotate);
			});

			this.$on('page-size', function(width, height) {
				!this.height  && !this.width && this.pdf.setCanvasHeight(this.pdf.getCanvas().offsetWidth  * (height / width) + 'px');
			});

			this.pdf.loadDocument(this.src);
		},

		// doc: destroyed hook is not called during server-side rendering.
		destroyed: function() {

			this.pdf.destroy();
		}
	}

}
