import EnhancedJSONModelRenderer from "./EnhancedJSONModelRenderer";


const EditorCanvas = ({ initialModel }) => {
    useEffect(() => {
    if (onModelChange) onModelChange(pageModel);
        }, [pageModel]);
  return (
    <div className="border p-4 bg-gray-50 rounded-lg">
      <EnhancedJSONModelRenderer model={initialModel} />
    </div>

  );
};

export default EditorCanvas;