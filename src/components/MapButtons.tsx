import React from "react";
import { IconArrowBack, IconRipple, IconCheck } from "@tabler/icons-react";
import { Menu, Transition } from "@headlessui/react";

interface ZoomOutButtonProps {
  onZoomOut: () => void;
}

export const ZoomOutButton: React.FC<ZoomOutButtonProps> = ({ onZoomOut }) => (
  <div className="absolute top-16 right-4 z-50 mt-1 mr-1">
    <button
      onClick={onZoomOut}
      className="bg-white text-black border px-2 py-2 rounded shadow-md hover:bg-gray-300"
    >
      <IconArrowBack />
    </button>
  </div>
);

interface GeoJsonMenuProps {
  geoJsonFiles: Array<{ name: string; file: string }>;
  selectedFiles: string[];
  onSelectFile: (file: string) => void;
}

export const GeoJsonMenu: React.FC<GeoJsonMenuProps> = ({
  geoJsonFiles,
  selectedFiles,
  onSelectFile,
}) => (
  <div className="absolute top-28 mr-1 mt-1 right-4 z-50">
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="bg-white text-black font-weight-bold border px-2 py-[7px] rounded hover:bg-gray-300 ">
          <IconRipple />
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-left bg-white text-black divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {geoJsonFiles.map((file) => (
              <Menu.Item key={file.file}>
                {({ active }) => (
                  <div
                    onClick={() => onSelectFile(file.file)}
                    className={`cursor-pointer px-4 py-2${
                      active ? "bg-gray-100" : "bg-white"
                    } flex justify-between items-center`}
                  >
                    <span>{file.name}</span>
                    {selectedFiles.includes(file.file) && (
                      <IconCheck className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
);
