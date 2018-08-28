import $ from 'jquery'
class Odometer{
	public digits:number[] = []
	public digitPositions:number[] = []
	private scrollDirection:string = this.startValue> this.endValue ? 'down' : 'up'
	// set in constructor
	private height = 0

	constructor(
		public startValue: number,
		public endValue: number,
		public duration: number,
		public el: JQuery,
	){
		//create container
		el.append('<div class="odometer-container"></div>')
		const container = el.children('.odometer-container')
		
		//populate digits
		if(this.scrollDirection === 'down'){
			for(let i = 0; i < endValue.toString().length; i++)
			container.append(`
				<div class="digit">
					<div>0</div>
					<div>9</div>
					<div>8</div>
					<div>7</div>
					<div>6</div>
					<div>5</div>
					<div>4</div>
					<div>3</div>
					<div>2</div>
					<div>1</div>
					<div>0</div>
				</div>
			`)
		}

		//now that html exists, set height of container
		const height = container.children('.digit').children()[0].clientHeight
		container.height(height)

	}
	async update(){
		const container = this.el.children('.odometer-container')
		const digits = container.children('.digit')

		//spin her up
		digits.addClass('spin-ease-in')
		
		//calm down after a bit
		setTimeout(() => {
			digits.removeClass('spin-ease-in')
			digits.addClass('spin-ease-out')
			for(let i = 0; i < digits.length; i++){
				$(digits[i]).children().last().html(this.endValue.toString()[i])
			}
		}, this.duration/2)
	}		
}
  
const odometer = new Odometer(1000, 296, 2000, $('#odometer'))
odometer.update()