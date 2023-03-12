import React, { useState } from "react";
import MDInput from "../MDInput";
import MDBox from "components/MDBox";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "firebase/storage";
import { firebaseStorage } from "../../../src/layouts/authentication/components/firebase.js";

const UploadFileDialog = ({ label = "Đường dẫn tệp", order, fileCount }) => {
  const [fileUrls, setFileUrls] = useState(Array.from({ length: fileCount }));

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const storageRef = ref(firebaseStorage, `/files/${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setFileUrls((prevUrls) => {
          const newUrls = [...prevUrls];
          newUrls[order] = `${percent}%`;
          return newUrls;
        });
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFileUrls((prevUrls) => {
            const newUrls = [...prevUrls];
            newUrls[order] = url;
            return newUrls;
          });
        });
      }
    );
  };

  return (
    <MDBox display="grid" gridTemplateColumns="1fr 1fr" gridgap="5px">
      <MDInput
        type="text"
        label={label}
        fullWidth
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ readOnly: true }}
        className="uploadFileDialog"
        value={fileUrls[order]}
      />
      <input
        id={`fileInput-${order}`}
        type="file"
        onChange={handleFileUpload}
        style={{ position: "absolute", width: "0", height: "0", opacity: "0", overflow: "hidden" }}
      />
      <MDBox style={{ display: "flex", alignItems: "center", marginLeft: "5px" }}>
        <label htmlFor={`fileInput-${order}`} style={{ fontSize: "0.9rem" }}>
          Chọn tệp...
        </label>
      </MDBox>
    </MDBox>
  );
};

export default UploadFileDialog;
