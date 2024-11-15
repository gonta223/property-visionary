// ... (previous imports and constants remain the same)

const ExtractTest = () => {
  // ... (previous state and functions remain the same until the render part)

  const renderComparisonTable = () => {
    if (extractedInfoArray.length === 0) return null;

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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

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
          {/* Previous input sections remain the same */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm font-medium">APIキー</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..."
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-count" className="text-sm font-medium">リクエスト回数 (1-10)</Label>
              <Input
                id="request-count"
                type="number"
                min="1"
                max="10"
                value={requestCount}
                onChange={handleRequestCountChange}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">画像アップロード</Label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors duration-200
                ${customImage ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              `}
            >
              <input {...getInputProps()} />
              {customImage ? (
                <div className="relative w-full h-64">
                  <img
                    src={customImage}
                    alt="Uploaded property"
                    className="absolute inset-0 w-full h-full object-contain rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200 rounded-md" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📸</div>
                  <p className="text-gray-600">画像をドロップするか、クリックしてファイルを選択</p>
                  <p className="text-sm text-gray-500">対応フォーマット: JPG, PNG</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExtract}
              disabled={isLoading}
              className={`flex-1 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  処理中... {progress}%
                </span>
              ) : (
                '情報を抽出'
              )}
            </Button>
            {(extractedInfoArray.length > 0 || customImage) && (
              <Button
                onClick={resetTest}
                variant="outline"
                className="flex-1"
              >
                リセット
              </Button>
            )}
          </div>

          {/* API使用状況 */}
          {apiUsage.totalRequests > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">API使用状況:</h3>
              <div className="space-y-1 text-sm">
                <p>総リクエスト数: {apiUsage.totalRequests}回</p>
                <p>入力トークン数: {apiUsage.inputTokens.toLocaleString()}トークン (${(apiUsage.inputTokens * COST_PER_INPUT_TOKEN).toFixed(4)})</p>
                <p>出力トークン数: {apiUsage.outputTokens.toLocaleString()}トークン (${(apiUsage.outputTokens * COST_PER_OUTPUT_TOKEN).toFixed(4)})</p>
                <p>総トークン数: {(apiUsage.inputTokens + apiUsage.outputTokens).toLocaleString()}トークン</p>
                <p>推定総コスト: ${apiUsage.estimatedCost.toFixed(4)}</p>
              </div>
            </div>
          )}

          {/* デバッグログ表示 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">デバッグログ:</h3>
            <pre className="text-xs font-mono bg-gray-100 p-2 rounded max-h-40 overflow-auto">
              {debugLogs.join('\n')}
            </pre>
          </div>

          {extractedInfoArray.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-800">抽出結果の比較</h2>
                {renderComparisonTable()}
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

              {rawDataArray.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-blue-800">API レスポンス:</h3>
                  {rawDataArray.map((rawData, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="text-md font-medium mb-2">レスポンス #{index + 1}</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono border border-gray-200">
                        <code>{JSON.stringify(rawData, null, 2)}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractTest;
