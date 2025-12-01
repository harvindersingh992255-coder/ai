"use client";

export default function SetupInterview() {
  const start = () => {
    window.location.href = "/interview/active";
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Interview Setup</h1>
      <button
        onClick={start}
        style={{
          padding: "10px 20px",
          background: "blue",
          color: "white",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        Start Interview
      </button>
    </div>
  );
}
