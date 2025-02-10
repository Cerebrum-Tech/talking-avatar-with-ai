export default function FirstVideo() {
    return (
      <>
        <video className="w-screen h-screen" autoPlay loop>
          <source src="video.mp4" type="video/mp4" onClick={()=> {}}/>
        </video>
      </>
    );
  }
  