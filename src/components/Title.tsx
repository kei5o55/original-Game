type TitleProps = {
  onStart: () => void;
};

const Title: React.FC<TitleProps> = ({ onStart }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>MISORIA : Frontier</h1>
      <p>— 放棄された世界を、照らせ —</p>

      <button onClick={onStart}>
        探索開始
      </button>
    </div>
  );
};

export default Title;
