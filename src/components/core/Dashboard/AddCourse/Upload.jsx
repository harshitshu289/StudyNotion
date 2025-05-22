import { useEffect, useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const { course } = useSelector((state) => state.course);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  );

  const inputRef = useRef(null);

  // When file is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      previewFile(file);
      setSelectedFile(file);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  useEffect(() => {
    register(name, { required: true });
  }, [register]);

  useEffect(() => {
    setValue(name, selectedFile);
  }, [selectedFile, setValue]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>

      <input
        type="file"
        accept={video ? "video/mp4" : "image/png, image/jpeg, image/jpg"}
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500 bg-richblack-700"
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <div className="relative pt-[56.25%]">
                <ReactPlayer
                  url={previewSource}
                  controls
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
            )}
            {!viewData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSource("");
                  setSelectedFile(null);
                  setValue(name, null);
                }}
                className="mt-3 text-richblack-400 underline"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6 text-center">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-[#171717]">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-sm text-richblack-200">
              Click to{" "}
              <span className="text-yellow-50 font-semibold">Browse</span> or
              drag and drop an {video ? "video" : "image"} file
            </p>
            {!video && (
              <ul className="mt-10 flex list-disc justify-between space-x-12 text-xs text-richblack-200">
                <li>Aspect ratio 16:9</li>
                <li>Recommended size 1024x576</li>
              </ul>
            )}
          </div>
        )}
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}
