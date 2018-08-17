import $ from 'jquery'

class Odometer{
	public digits:number[] = []

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

			//generate html
			$(container).append(
				`<div class="digit">
				<div>1</div>
				<div>0</div>
				</div>`
			)
		}
	}
	async update(){
		const container = $(this.el).children('.odometer-container')
		let height = parseInt($(this.el).css('font-size').slice(0, -2))
		let scrollDirection = this.startValue > this.endValue ? 'down' : 'up'
		let top = scrollDirection === 'down' ? height - height * 2 : 0
		let cutoff = scrollDirection === 'down' ? 0 : height - height * 2
		let speed = 100

		let spinning = true

		//get us out eventually
		setTimeout(() => {
			//stop the ride
			spinning = false

			//finish the loop with our final result
			$(container).children('.digit').css('top', '0px')

			//move to next reset position
			for(let i = top; i <= cutoff; i++){
				$(container).children('.digit').css('top', `${i}px`)
			}
			//push result to html
			var resultPosition = scrollDirection === 'down' ? 0 : 1
			for(let i = 0; i < this.digits.length; i++){
				$($($(container).children('.digit')[i]).children()[resultPosition]).html(this.digits[i].toString())
			}
			//bring em in
			top = 0
			speed = 10
			const finalLoop = setInterval(() =>{
				$(container).children('.digit').css('top', `${top}px`)
				top+= speed
				if(top > cutoff){
					$(container).children('.digit').css('top', `${cutoff}px`)
					clearInterval(finalLoop)
				} 
			},1000/60)


		}, this.duration)
		
		//animate in the meantime
		const loop = setInterval(() => {
			//move elements
			if(
				(top < cutoff && scrollDirection === 'up') ||
				(top > cutoff && scrollDirection === 'down')
			){
				//reset at cutoff
				top = scrollDirection === 'down' ? height - height * 2 : 0
				//increment numbers
				const htmlDigits = $(container).children('.digit')
				for(let i = 0; i < htmlDigits.length; i++){

					let newVal = parseInt($($(htmlDigits[i]).children()[0]).html()) + 1
					if(newVal === 9) newVal = 0
					$($(htmlDigits[i]).children()[0]).html(newVal.toString())

					newVal = parseInt($($(htmlDigits[i]).children()[1]).html()) + 1
					if(newVal === 9) newVal = 0
					$($(htmlDigits[i]).children()[1]).html(newVal.toString())
				}
			} 

			$(container).children('.digit').css('top', `${top}px`)
			if(scrollDirection === 'up'){
				top -= speed/10
			}else{
				top += speed/10
			}
			
			//bail
			if(!spinning) {
				clearInterval(loop)
			}
		},1000/60)
	}
}
  
const odometer = new Odometer(1000, 296, 2000, $('#odometer'))
odometer.update()