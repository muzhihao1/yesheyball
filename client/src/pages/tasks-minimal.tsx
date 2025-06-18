export default function TasksMinimal() {
  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-white rounded-lg border-2 border-green-200 p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">系统训练：第1集</h2>
        <p className="text-gray-600 mb-4">握杆基础训练，掌握正确的握杆姿势和基本击球技巧。</p>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg">
          开始系统训练
        </button>
      </div>
      
      <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">自主训练</h2>
        <p className="text-gray-600 mb-4">根据个人需要进行针对性练习，专注于特定技巧或弱项改进。</p>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
          开始自主训练
        </button>
      </div>
    </div>
  );
}