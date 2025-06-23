import { useRef } from "react";

// // Hook để sử dụng với trigger element
export const useDropdownTrigger = () => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  return {
    triggerRef,
    getTriggerProps: () => ({
      ref: triggerRef,
      className: "dropdown-toggle", // Class để nhận diện trigger
    }),
  };
};