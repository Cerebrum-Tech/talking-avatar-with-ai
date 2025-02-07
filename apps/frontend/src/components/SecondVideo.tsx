export default function SecondVideo() {
  return (
    <>
      <video className="w-screen h-screen" autoPlay loop muted onClick={()=> {
            location.href = "/pick-language";
        }}>
        <source src="second-video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
