// ... (previous imports and constants remain the same)

const ExtractTest = () => {
  // ... (previous state declarations remain the same)

  const generateFinalVersion = () => {
    if (extractedInfoArray.length === 0) return null;

    const finalVersion = {};
    keyItems.forEach(key => {
      const values = extractedInfoArray.map(info => info[key] || '情報なし');
      
      // 値ごとの出現回数をカウント
      const valueCounts = values.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      // 最も出現回数が多い値を取得
      const maxCount = Math.max(...Object.values(valueCounts));
      const mostFrequent = Object.entries(valueCounts)
        .filter(([_, count]) => count === maxCount)
        .map(([value]) => value);

      if (mostFrequent.length === 1) {
        // 一意の最頻値がある場合
        finalVersion[key] = mostFrequent[0];
      } else {
        // 同率の場合の優先順位付け
        const prioritizedValue = mostFrequent
          .filter(v => v !== '情報なし') // 情報なし以外を優先
          .sort((a, b) => {
            // より長い（詳細な）情報を優先
            if (a.length !== b.length) return b.length - a.length;
            // それでも同じ場合は最初の値を使用
            return values.indexOf(a) - values.indexOf(b);
          })[0] || mostFrequent[0]; // フィルタ後が空の場合は最初の値を使用

        finalVersion[key] = prioritizedValue;
      }
    });

    return finalVersion;
  };

  const renderComparisonTable = () => {
    if (extractedInfoArray.length === 0) return null;

    const finalVersion = generateFinalVersion();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">項目</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">一致率</th>
              {extractedInfoArray.map((_, index) => (
                <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  抽出 #{index + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                最終バージョン
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keyItems.map(key => {
              const match = calculateMatchRate(key);
              if (!match) return null;
              
              return (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {key}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="flex-grow bg-gray-200 rounded-full h-2.5 w-full">
                        <div
                          className={`h-2.5 rounded-full ${
                            match.rate === 100 ? 'bg-green-500' :
                            match.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${match.rate}%` }}
                        />
                      </div>
                      <span className="flex-shrink-0 w-12 text-right">
                        {match.rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  {extractedInfoArray.map((info, index) => (
                    <td key={index} className="px-4 py-2 text-sm text-gray-500">
                      <div className="whitespace-pre-wrap">
                        {info[key] || '情報なし'}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 bg-green-50">
                    <div className="whitespace-pre-wrap">
                      {finalVersion[key]}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ... (rest of the component remains the same)

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-800">
            物件情報抽出テスト
            <span className="text-sm font-normal text-gray-600 ml-2">
              (同時実行数: 最大{MAX_CONCURRENT_REQUESTS}件)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... (previous content remains the same) ... */}

          {extractedInfoArray.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-800">抽出結果の比較</h2>
                {renderComparisonTable()}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-800">最終バージョン</h2>
                <Card className="p-4">
                  <PropertyListing propertyInfo={generateFinalVersion()} />
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-800">個別の抽出結果</h2>
                <div className="grid grid-cols-1 gap-4">
                  {extractedInfoArray.map((info, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="text-lg font-semibold mb-4">結果 #{index + 1}</h3>
                      <PropertyListing propertyInfo={info} />
                    </Card>
                  ))}
                </div>
              </div>

              {/* ... (rest of the content remains the same) ... */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractTest;
