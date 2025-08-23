import JSONModelRenderer from "./JSONModelRenderer";


const EditorCanvas = ({ initialModel }) => {
    useEffect(() => {
    if (onModelChange) onModelChange(pageModel);
        }, [pageModel]);
  return (
    <div className="border p-4 bg-gray-50 rounded-lg">
      <JSONModelRenderer model={initialModel} />
    </div>

  );
};

export default EditorCanvas;
