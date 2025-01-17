export const getCellColor = (value: string) => {
    if (!value) return 'bg-white hover:bg-gray-50';
    const colors = [
      'bg-blue-100 hover:bg-blue-200',
      'bg-green-100 hover:bg-green-200',
      'bg-purple-100 hover:bg-purple-200',
      'bg-pink-100 hover:bg-pink-200',
      'bg-yellow-100 hover:bg-yellow-200',
      'bg-red-100 hover:bg-red-200',
    ];
    return colors[value.charCodeAt(0) % colors.length];
  };