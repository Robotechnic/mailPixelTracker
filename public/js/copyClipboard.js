document.querySelectorAll(".copyButton").forEach((button)=>{
	button.addEventListener("click",copy)
})

function copy(event) {
	event.target.classList.add("copied")
	event.target.textContent="Copié"
	navigator.clipboard.writeText(`${window.location.origin}/pixel/${event.target.getAttribute("pixelId")}`)
}