const Section = (props) => {
  return (
    <div
      id={props.id}
      className={`w-full py-12 leading-loose ${props.className || ''}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-left text-skin-primary">
            {props.title}
          </h2>
          {props.extra}
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default Section;
