// Import images
import topIcons from "../../public/images/top-icons.png";
import arrow from "../../public/images/arrow.png";
import profilePicture_female from "../../public/images/fille_pdp.png";
import profilePicture_male from "../../public/images/garcon.png";
import camera from "../../public/images/camera.png";
import arrowGrey from "../../public/images/arrow_grey.png";
import conversation from "../../public/conversations/conversation-main.json"; // Import JSON file


export const Background: React.FC<{ darkTheme: boolean }> = ({ darkTheme }) => {
  return (
    <div
      id="big_container"
      className={`flex justify-center ${darkTheme ? "bg-black" : "bg-white"} w-full h-full`}
    >
      <div
        id="screen"
        className={`relative w-[1080px] h-[1920px] flex flex-col rounded-4xl shadow-lg overflow-hidden ${darkTheme ? "bg-gray-900" : "bg-white"
          }`}
      >
        {/* Dedicated Blur Layer
        <div
          id="blur_container"
          className="absolute inset-0 overflow-hidden"
          style={{
            width: '3000px',
            height: '370px',
            zIndex: 2, // Place it below the header content but above the background
          }}
        >

          <div
            id="blur_layer"
            className="absolute inset-0"
            style={{
              width: '10000px',
              height: '10000px',
              backdropFilter: 'blur(60px)',
              WebkitBackdropFilter: 'blur(60px)',
              transform: 'scale(1.5)', // Extend blur effect beyond boundaries
              zIndex: 5, // Place it above the background but below the header content
              filter: 'blur(50px)',
              padding: '150px', // ou une valeur suffisante pour "absorber" le flou

            }}
          ></div>
        </div> */}

        {/* Main Header Section */}
        <div id="header"
          className="relative border-b border-gray-500 rounded-t-4xl z-10"
          style={{
            backgroundColor: darkTheme ? "rgba(30, 30, 30, 1.65)" : "rgba(230, 230, 230, 1.65)",
          }}
        >
          <div id="before-top" className="flex justify-between text-black font-semibold text-lg px-24 py-12 pr-16">
            <div className={`top-left text-5xl ${darkTheme ? "text-white" : "text-black"}`}>23:04</div>
            <div className="top-right">
              <img
                src={topIcons}
                alt="Top Icons"
                className={`h-8 ${darkTheme ? "filter invert" : ""}`}
              />
            </div>
          </div>
          <div className="px-16 flex justify-between items-end">
            <img src={arrow} alt="Back Arrow" className="h-15 " />
            <img
              src={conversation.gender === "male" ? profilePicture_male : profilePicture_female}
              alt="Profile Picture"
              className="ml-5 h-36 rounded-full"
            />
            <img src={camera} alt="Camera Icon" className="h-12" />
          </div>
          <div id="name" className={`flex justify-center items-center ${darkTheme ? "text-gray-300" : "text-gray-700"
            } text-3xl font-light mt-4 mb-8`}>
            <p className="font-bold">{conversation.botName}</p>
            <img src={arrowGrey} alt="Arrow Grey" className="ml-3 mt-1 h-5 transform scale-x-[-1]" />
          </div>
        </div>

        {/* Home Bar */}
        <div id="home_bar" className={`absolute h-3 w-1/3 bottom-8 left-1/2 transform -translate-x-1/2 rounded-full z-1000 ${darkTheme ? "bg-white" : "bg-black"}`}></div>
      </div>
    </div>
  );
};