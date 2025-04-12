import React from "react";
import { assets, features } from "../assets/assets";

const BottomBanner = () => {
  return (
    <div className="relative mt-24">
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full md:hidden"
      />

      <div className="absolute inset-0 flex flex-col md:items-end md:justify-center pt-16 md:pt-0 md:pr-[10%] px-4 md:px-0">
        <div>
          <h1 className="text-6xl md:text-6xl font-semibold text-primary mb-6">
            Why we are best?
          </h1>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 mt-2">
              <img
                src={feature.icon}
                alt={feature.title}
                className="md:w-11 w-9"
              />
              <div className="flex flex-col">
                <h3 className="text-base md:text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomBanner;
