import $ from 'jquery'

class Odometer{
	public digits:number[] = []
	public digitPositions:number[] = []

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
	}
	async update(){
		const startTime = new Date().getTime()
		const container = $(this.el).children('.odometer-container')
		let height = parseInt($(this.el).css('font-size').slice(0, -2))
		let scrollDirection = this.startValue > this.endValue ? 'down' : 'up'
		let top = scrollDirection === 'down' ? height - height * 2 : 0
		let cutoff = scrollDirection === 'down' ? 0 : height - height * 2
		let speed = 10

		let spinning = true

		//init top position for all digits
		const htmlDigits = $(container).children('.digit')
		for(let i = 0; i < this.digitPositions.length; i++){
			$(htmlDigits).css('top', `${this.digitPositions[top]}px`)
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
				} 
				//apply new height
				$(htmlDigits[i]).css('top', `${this.digitPositions[i]}px`)
				if(scrollDirection === 'up'){
					this.digitPositions[i] -= speed/10 - i * 2
				}else{
					this.digitPositions[i] += speed/10 + i * 2
				}
			}
			
			//bail
			if(!spinning) {
				//ensure this is the last iteration
				clearInterval(loop)

				//move each digit to its reset position
				const setProperValues = setInterval(() => {
					let isFinished = true

					for(let i = 0; i < htmlDigits.length; i++){
						//check if the end result digit is in the proper div
						const properDigitIsShown = scrollDirection === 'down' ? 
							$($(htmlDigits[i]).children()[0]).html().toString() === this.digits[i].toString() :
							$($(htmlDigits[i]).children()[1]).html().toString() === this.digits[i].toString()

						//check if the digit place is in the proper position
						const digitIsInCorrectPosition = scrollDirection === 'down' ? 
							this.digitPositions[i] >= cutoff : 
							this.digitPositions[i] <= top
						
						if(!properDigitIsShown || !digitIsInCorrectPosition){
							//reset with new number
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

								if(scrollDirection === 'down'){
									$($(htmlDigits[i]).children()[1]).html(newVal.toString())
									$($(htmlDigits[i]).children()[0]).html(this.digits[i].toString())
								}else{
									$($(htmlDigits[i]).children()[0]).html(newVal.toString())
									$($(htmlDigits[i]).children()[1]).html(this.digits[i].toString())
								}
								
							} 
							//apply new height
							$(htmlDigits[i]).css('top', `${this.digitPositions[i]}px`)
							if(scrollDirection === 'up'){
								this.digitPositions[i] -= speed/10 - i * 2
							}else{
								this.digitPositions[i] += speed/10 + i * 2
							}
							isFinished = false
						}
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