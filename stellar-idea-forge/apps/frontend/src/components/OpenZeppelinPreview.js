import React from "react";
import { ArrowDown, PlusCircle, Send, Flame} from "lucide-react";

const OpenZeppelinPreview = ({ type, flows, security }) => {
  // Map icons for flows
  const icons = {
    Mint: <PlusCircle className="w-5 h-5 text-green-600" />,
    Transfer: <Send className="w-5 h-5 text-blue-600" />,
    Burn: <Flame className="w-5 h-5 text-red-600" />,
  };

  return (
    <div className="p-4 rounded-2xl shadow-md bg-white max-w-md mx-auto border border-gray-200">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        🔒 {type} Contract
      </h2>

      {/* Flowchart */}
      <div className="flex flex-col items-center">
        {flows.map((flow, i) => (
          <div key={i} className="relative group mb-6 flex flex-col items-center">
            {/* Node */}
            <div
              className="px-4 py-2 rounded-lg bg-green-100 border border-green-400 
                         flex items-center gap-2 transition-transform duration-200 
                         hover:scale-105"
            >
              {icons[flow]} {flow}
            </div>

            {/* Tooltip (now above the node) */}
            <span
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                         hidden group-hover:block text-sm bg-black text-white 
                         rounded px-2 py-1 shadow-md whitespace-nowrap"
            >
              Kit pre-armado para {flow.toLowerCase()}
            </span>

            {/* Arrow except last */}
            {i < flows.length - 1 && (
              <ArrowDown className="w-5 h-5 text-gray-400 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="mt-4 flex items-center justify-center text-green-600 font-medium gap-2">
        🛡️ {security}
      </div>
    </div>
  );
};

export default OpenZeppelinPreview;