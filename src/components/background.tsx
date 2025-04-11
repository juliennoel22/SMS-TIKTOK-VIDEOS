// Import images
import topIcons from "../../public/images/top-icons.png";
import arrow from "../../public/images/arrow.png";
import profilePicture from "../../public/images/gogol_profile_picture.png";
import camera from "../../public/images/camera.png";
import arrowGrey from "../../public/images/arrow_grey.png";

export const Background: React.FC = () => {
  return (
    <div id="big_container" className="flex justify-center bg-white w-full h-full">
      <div id="screen" className="relative bg-red- w-[1080px] h-[1920px] flex flex-col rounded-4xl shadow-lg">
        {/* Header Section */}
        <div id="header" className="bg-gray-200 border-b border-gray-900 rounded-t-4xl z-10">
          <div id="before-top" className="flex justify-between text-black font-semibold text-lg px-16 py-8">
            <div className="top-left text-5xl">23:04</div>
            <div className="top-right">
              <img src={topIcons} alt="Top Icons" className="h-8" />
            </div>
          </div>
          <div className="px-16 flex justify-between items-center">
            <img src={arrow} alt="Back Arrow" className="h-15" />
            <img src={profilePicture} alt="Profile Picture" className="h-32" />
            <img src={camera} alt="Camera Icon" className="h-12" />
          </div>
          <div id="name" className="flex justify-center items-center text-black text-3xl mt-4 mb-8">
            <p className="font-bold">Jane</p>
            <img src={arrowGrey} alt="Arrow Grey" className="ml-1 h-3 transform scale-x-[-1]" />
          </div>
        </div>
        {/* Home Bar */}
        <div id="home_bar" className="absolute bg-black h-3 w-1/3 bottom-8 left-1/2 transform -translate-x-1/2 rounded-full"></div>
      </div>
    </div>
  );
};