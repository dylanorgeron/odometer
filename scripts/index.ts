import $ from 'jquery'

class Odometer{
	public digits:number[] = []
	public digitPositions:number[] = []
	public revolutions:number[] = []

	constructor(
		public startValue: number,
		public endValue: number,
		public duration: number,
		public el: JQuery,
	){
		//create container
		$(el).append('<div class="odometer-container"></div>')
		const container = $(this.el).children('.odometer-container')
		const height = $(this.el).css('font-size').slice(0, -2)
		$(container).css('height', height)
		
		const distanceToTravel = Math.abs(this.startValue - this.endValue)

		//populate digit places
		for(let i = 0; i < this.startValue.toString().length; i++){

			//build digit array for final result
			if(this.endValue.toString().length > i){
				this.digits.push(
					parseInt(
						this.endValue.toString()[i]	
					)
				)
			}else{
				this.digits.unshift(0)
			}

			this.digitPositions.push(0)
			this.revolutions[i] = Math.floor(distanceToTravel / 10**i)

			//generate html
			let firstPos = this.startValue < this.endValue ? this.startValue.toString()[i] : parseInt(this.startValue.toString()[i]) - 1
			let secondPos = this.startValue > this.endValue ? this.startValue.toString()[i] : parseInt(this.startValue.toString()[i]) - 1

			if(firstPos > 9) firstPos = 0
			if(firstPos < 0) firstPos = 9
			if(secondPos > 9) secondPos = 0
			if(secondPos < 0) secondPos = 9

			$(container).append(
				`<div class="digit">
				<div>${firstPos}</div>
				<div>${secondPos}</div>
				</div>`
			)

		}
		this.revolutions.reverse()
	}
	async update(){
		const container = $(this.el).children('.odometer-container')
		let height = parseInt($(this.el).css('font-size').slice(0, -2))
		let scrollDirection = this.startValue > this.endValue ? 'down' : 'up'
		let top = scrollDirection === 'down' ? height - height * 2 : 0
		let cutoff = scrollDirection === 'down' ? 0 : height - height * 2
		const htmlDigits = $(container).children('.digit')
		const rpm = this.duration / this.revolutions[this.revolutions.length-1]

		for(let i = 0; i < this.digitPositions.length; i++){
			//init top position for all digits
			$(htmlDigits).css('top', `${this.digitPositions[top]}px`)
		}
	
		//animate in the meantime
		const loop = setInterval(() => {
			//move elements
			const htmlDigits = $(container).children('.digit')
			for(let i = 0; i < htmlDigits.length; i++){
				//reset if needed
				if(
					(this.digitPositions[i] < cutoff && scrollDirection === 'up') ||
					(this.digitPositions[i] > cutoff && scrollDirection === 'down')
				){
					this.digitPositions[i] = scrollDirection === 'down' ? height - height * 2 : 0
					//increment numbers
					const increment = scrollDirection === 'down' ? -1 : 1
					let newVal = parseInt($($(htmlDigits[i]).children()[0]).html()) + increment
					if(newVal > 9) newVal = 0
					if(newVal < 0) newVal = 9
					$($(htmlDigits[i]).children()[0]).html(newVal.toString())

					newVal = parseInt($($(htmlDigits[i]).children()[1]).html()) + increment
					if(newVal > 9) newVal = 0
					if(newVal < 0) newVal = 9
					$($(htmlDigits[i]).children()[1]).html(newVal.toString())
					
					if(this.revolutions[i] > 0) 
					{
						this.revolutions[i]--
					}
				} 
				//apply new height
				if(this.revolutions[i] > 0 || this.digits[i] != parseInt($($(htmlDigits[i]).children()[0]).html())){
					$(htmlDigits[i]).css('top', `${this.digitPositions[i]}px`)
					if(scrollDirection === 'up'){
						this.digitPositions[i] -= 10
					}else{
						this.digitPositions[i] += 10
					}
				}else if(this.revolutions[i] === 0 && this.digits[i] === parseInt($($(htmlDigits[i]).children()[0]).html())){
					$(htmlDigits[i]).css('top', `${cutoff}px`)
				}
			}
			//all done, wrap it up
			if(!this.revolutions.find((e) => e > 0)) {
				for(let i = 0; i < htmlDigits.length; i++){
					$($(htmlDigits[i]).html(this.digits[i].toString()))
				}
				$(htmlDigits).css('top', `${cutoff}px`)
				clearInterval(loop)
			}
		},1000/60)
	}
}
  
const odometer = new Odometer(100, 79, 1000, $('#odometer'))
odometer.update()