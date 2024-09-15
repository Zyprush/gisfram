import Image from "next/image";
import React from "react";

const PrintHeader = () => {
  return (
    <div className="flex items-center h-auto mb-auto mt-0 bg-white dark:bg-white justify-evenly w-full">
      <div className="rounded-full overflow-hidden ml-10 w-[100px]">
        <Image src={"/img/paluan-logo.png"} alt="logo" height={200} width={200} />
      </div>
      <div className="mx-auto text-center leading-tight text-green-800">
        <h1 className=" font-bold font-sans">
          Republic of the Philippines
        </h1>
        <h2 className=" font-semibold font-sans uppercase">
          PROVINCE OF OCCIDENTAL MINDORO
        </h2>
        <h3 className=" font-medium font-serif">Municipality of Paluan</h3>
        <h4 className=" font-medium font-sans capitalize">
          municipal disaster risk reduction and management office
        </h4>
      </div>
      <div className="overflow-hidden rounded-full mr-10 w-[100px]">
        <Image src={"/img/logo.png"} alt="logo" height={200} width={200} />
      </div>
    </div>
  );
};

export default PrintHeader;
