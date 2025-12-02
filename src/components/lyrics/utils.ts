export const isFMSession = () => {
	return !document.querySelector(".m-player-fm")?.classList.contains("f-dn");
}
