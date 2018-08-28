import $ from 'jquery'

class Odometer{
	public digits:number[] = []
	public digitPositions:number[] = []
	private digitsToHide = this.startValue.toString().length - this.endValue.toString().length
	private scrollDirection:string = this.startValue> this.endValue ? 'down' : 'up'
	private increment = this.scrollDirection === 'down' ? -1 : 1
	private targetSpeed = 50
	// set in constructor
	private height = 0
	private top = 0
	private cutoff = 0

	constructor(
		public startValue: number,
		public endValue: number,
		public duration: number,
		public el: JQuery,
	){
		//create container
		$(el).append('<div class="odometer-container"></div>')
		const container = $(this.el).children('.odometer-container')

		//populate digit places
		for(let i = 0; i < this.startValue.toString().length; i++){

			//build digit array for final result
			if(this.endValue.toString().length > i){
				this.digits.push(parseInt(this.endValue.toString()[i]))
			}else{
				this.digits.unshift(0)
			}
			this.digitPositions.push(0)

			//get values to use
			let firstPos = this.startValue < this.endValue ? this.startValue.toString()[i] : parseInt(this.startValue.toString()[i]) + this.increment
			let secondPos = this.startValue > this.endValue ? this.startValue.toString()[i] : parseInt(this.startValue.toString()[i]) + this.increment

			//loop back to start
			if(firstPos > 9) firstPos = 0
			if(firstPos < 0) firstPos = 9
			if(secondPos > 9) secondPos = 0
			if(secondPos < 0) secondPos = 9

			//create html
			$(container).append(
				`<div class="digit">
				<div>${firstPos}</div>
				<div>${secondPos}</div>
				</div>`
			)
		}
		//init vars that depend on html

		//get height based on font size of digits
		this.height = container.children('.digit')[0].children[0].clientHeight
		$(container).css('height', this.height)
		
		//set top (resting position) and cutoff (point of reset)
		this.top = this.scrollDirection === 'down' ? 0 - this.height :  0
		this.cutoff = this.scrollDirection === 'down' ? 0 : 0 - this.height

		//if we are scrolling down, we need to offset the digits to start
		if(this.scrollDirection === 'down'){
			$($(container).children('.digit')).css('top', `${0 - this.height}`)
		}
	}
	async update(){
		const startTime = new Date().getTime()
		const container = $(this.el).children('.odometer-container')
		let speed = 1
		let spinning = true

		//init top position for all digits
		const htmlDigits = $(container).children('.digit')
		for(let i = 0; i < this.digitPositions.length; i++){
			$(htmlDigits).css('top', `${this.digitPositions[this.top]}px`)
		}


		//get us out eventually
		setTimeout(() => {
			spinning = false
		}, this.duration - 250)
		
		//animate in the meantime
		const loop = setInterval(() => {
			//move elements
			const htmlDigits = $(container).children('.digit')
			for(let i = 0; i < htmlDigits.length; i++){
				//reset if needed
				if(
					(this.digitPositions[i] < this.cutoff && this.scrollDirection === 'up') ||
					(this.digitPositions[i] > this.cutoff && this.scrollDirection === 'down')
				){
					this.digitPositions[i] = this.scrollDirection === 'down' ? 0 - this.height : 0
					//increment numbers
					const increment = this.scrollDirection === 'down' ? -1 : 1
					let newVal = parseInt($($(htmlDigits[i]).children()[0]).html()) + increment
					if(newVal > 9) newVal = 0
					if(newVal < 0) newVal = 9
					$($(htmlDigits[i]).children()[0]).html(newVal.toString())

					newVal = parseInt($($(htmlDigits[i]).children()[1]).html()) + increment
					if(newVal > 9) newVal = 0
					if(newVal < 0) newVal = 9
					$($(htmlDigits[i]).children()[1]).html(newVal.toString())
				} 
				//apply new height
				$(htmlDigits[i]).css('top', `${this.digitPositions[i]}px`)
				if(this.scrollDirection === 'up'){
					this.digitPositions[i] -= (speed/10 + 2**i)
				}else{
					this.digitPositions[i] += (speed/10 + 2**i)
				}
				if(speed < this.targetSpeed){
					speed+=.5
				}
			}
			
			//bail
			if(!spinning) {
				//ensure this is the last iteration
				clearInterval(loop)

				//move each digit to its reset position
				const setProperValues = setInterval(() => {
					let isFinished = true
					const finalPosition = this.scrollDirection === 'down' ? this.cutoff : top
					for(let i = 0; i < htmlDigits.length; i++){
						//check if the end result digit is in the proper div
						const properDigitIsShown = this.scrollDirection === 'down' ? 
							$($(htmlDigits[i]).children()[0]).html().toString() === this.digits[i].toString() :
							$($(htmlDigits[i]).children()[1]).html().toString() === this.digits[i].toString()

						//check if the digit place is in the proper position
						const digitIsInCorrectPosition = this.scrollDirection === 'down' ? 
							this.digitPositions[i] >= this.cutoff : 
							this.digitPositions[i] <= this.top
						
						if(!properDigitIsShown || !digitIsInCorrectPosition){
							//reset with new number
							if(
								(this.digitPositions[i] < this.cutoff && this.scrollDirection === 'up') ||
								(this.digitPositions[i] > this.cutoff && this.scrollDirection === 'down')
							){
			
								this.digitPositions[i] = this.scrollDirection === 'down' ? 0 - this.height : 0

								//increment numbers
								const increment = this.scrollDirection === 'down' ? -1 : 1

								if(this.scrollDirection === 'down'){
									let newVal = parseInt($($(htmlDigits[i]).children()[1]).html()) + increment
									if(newVal > 9) newVal = 0
									if(newVal < 0) newVal = 9
									$($(htmlDigits[i]).children()[1]).html(newVal.toString())
									$($(htmlDigits[i]).children()[0]).html(this.digits[i].toString())
								}else{
									let newVal = parseInt($($(htmlDigits[i]).children()[0]).html()) + increment
									if(newVal > 9) newVal = 0
									if(newVal < 0) newVal = 9
									$($(htmlDigits[i]).children()[0]).html(newVal.toString())
									$($(htmlDigits[i]).children()[1]).html(this.digits[i].toString())
								}

								//set the leading 0s to be opacity 0
								if(i < this.digitsToHide && this.digits[i] === 0){
									$($(htmlDigits[i]).children()[0]).css('opacity', 0)	
								}
							} 
							//apply new height
							$(htmlDigits[i]).css('top', `${this.digitPositions[i]}px`)
							if(this.scrollDirection === 'up'){
								this.digitPositions[i] -= (speed/10 + 2**i)
							}else{
								this.digitPositions[i] += (speed/10 + 2**i)
							}
							isFinished = false
						}else{
							$(htmlDigits[i]).css('top', `${finalPosition}px`)
						}
						speed-=1
						if(speed < 10) speed = 10
					}
					if(isFinished){ 
						clearInterval(setProperValues)
						console.log(`Finished update in ${(new Date().getTime() - startTime) / 1000}s`)
					}
				}, 1000/60)
			}
		},1000/60)
	}
}
  
const odometer = new Odometer(1000, 296, 1000, $('#odometer'))
odometer.update()