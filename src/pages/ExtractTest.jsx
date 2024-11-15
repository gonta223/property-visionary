import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/use-toast";
import { useDropzone } from 'react-dropzone';
import PropertyListing from '../components/PropertyListing';

const MAX_CONCURRENT_REQUESTS = 5;

// GPT-4o APIの料金設定（2024年3月現在）
const COST_PER_INPUT_TOKEN = 0.000005;  // $5.00 per 1M tokens
const COST_PER_OUTPUT_TOKEN = 0.000015;  // $15.00 per 1M tokens

// 全ての抽出項目のリスト
const keyItems = [
  '物件名称',
  '家賃',
  '管理費',
  '共益費',
  '敷金',
  '礼金',
  '住所',
  '最寄駅',
  '駅からの距離',
  '建物種別',
  '構造',
  '階数',
  '築年数',
  'リフォーム年',
  '向き',
  '専有面積',
  '間取り',
  'バルコニー面積',
  '設備（キッチン）',
  '設備（バス・トイレ）',
  '設備（収納）',
  '設備（冷暖房）',
  '設備（セキュリティ）',
  '駐車場',
  'バイク置き場',
  '自転車置き場',
  'ペット可否',
  '契約期間',
  '現況',
  '引渡し時期',
  '取引形態',
  '備考',
  'インターネット',
  '鍵交換費',
  '火災保険',
  '保証会社',
  '保証料',
  '更新料',
  '仲介手数料',
  'その他初期費用',
  '特徴や魅力的なポイント',
  '取扱不動産会社',
  '電話番号',
  '不動産会社住所',
  '免許番号'
];

const ExtractTest = () => {
  const [apiKey, setApiKey] = useState('');
  const [extractedInfoArray, setExtractedInfoArray] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [rawDataArray, setRawDataArray] = useState([]);
  const [requestCount, setRequestCount] = useState(3);
  const completedRequestsRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [debugLogs, setDebugLogs] = useState([]);
  const [apiUsage, setApiUsage] = useState({
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  });
  const { toast } = useToast();

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const updateApiUsage = (promptTokens, completionTokens) => {
    setApiUsage(prev => {
      const newTotalRequests = prev.totalRequests + 1;
      const newInputTokens = prev.inputTokens + promptTokens;
      const newOutputTokens = prev.outputTokens + completionTokens;
      const inputCost = promptTokens * COST_PER_INPUT_TOKEN;
      const outputCost = completionTokens * COST_PER_OUTPUT_TOKEN;
      const newEstimatedCost = prev.estimatedCost + inputCost + outputCost;
      
      return {
        totalRequests: newTotalRequests,
        inputTokens: newInputTokens,
        outputTokens: newOutputTokens,
        estimatedCost: newEstimatedCost
      };
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target.result);
        addDebugLog('画像がアップロードされました');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleRequestCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (count > 0 && count <= 10) {
      setRequestCount(count);
      addDebugLog(`リクエスト回数が${count}回に設定されました`);
    }
  };

  const extractInfo = async (requestIndex) => {
    try {
      addDebugLog(`リクエスト #${requestIndex + 1} 開始`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "この不動産物件画像から以下の項目の情報を可能な限り詳細に抽出してください。情報が見つからない場合は「情報なし」と記入してください：1.物件名称、2.家賃、3.管理費、4.共益費、5.敷金、6.礼金、7.住所、8.最寄駅、9.駅からの距離、10.建物種別、11.構造、12.階数、13.築年数、14.リフォーム年、15.向き、16.専有面積、17.間取り、18.バルコニー面積、19.設備（キッチン）、20.設備（バス・トイレ）、21.設備（収納）、22.設備（冷暖房）、23.設備（セキュリティ）、24.駐車場、25.バイク置き場、26.自転車置き場、27.ペット可否、28.契約期間、29.現況、30.引渡し時期、31.取引形態、32.備考、33.取扱不動産会社、34.電話番号、35.不動産会社住所、36.免許番号、37.外観画像URL、38.内装画像1URL、39.間取り図URL、40.特徴や魅力的なポイント（3つ以上）、41.鍵交換費、42.火災保険、43.保証会社、44.保証料、45.更新料、46.仲介手数料、47.インターネット、48.その他初期費用。JSONフォーマットで出力してください。画像に含まれていない情報は「情報なし」としてください。"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: customImage
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      addDebugLog(`リクエスト #${requestIndex + 1} レスポンス受信: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        addDebugLog(`リクエスト #${requestIndex + 1} エラー: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      addDebugLog(`リクエスト #${requestIndex + 1} データ受信完了`);

      // トークン使用量を更新
      if (data.usage) {
        updateApiUsage(data.usage.prompt_tokens, data.usage.completion_tokens);
      }

      if (!data.choices?.[0]?.message?.content) {
        addDebugLog(`リクエスト #${requestIndex + 1} 無効なレスポンス構造: ${JSON.stringify(data)}`);
        throw new Error('Invalid response structure from API');
      }

      let extractedData;
      try {
        extractedData = JSON.parse(data.choices[0].message.content);
        addDebugLog(`リクエスト #${requestIndex + 1} JSONパース成功`);
      } catch (e) {
        addDebugLog(`リクエスト #${requestIndex + 1} JSONパースエラー: ${e.message}`);
        throw new Error('Failed to parse API response as JSON');
      }

      const cleanedData = {};
      for (const [key, value] of Object.entries(extractedData)) {
        const cleanKey = key.replace(/^\d+\./, '');
        cleanedData[cleanKey] = value || '情報なし';
      }

      addDebugLog(`リクエスト #${requestIndex + 1} 完了`);
      return { cleanedData, rawData: data };
    } catch (error) {
      addDebugLog(`リクエスト #${requestIndex + 1} 失敗: ${error.message}`);
      throw error;
    }
  };

  const processBatch = async (startIdx, endIdx) => {
    addDebugLog(`バッチ処理開始: ${startIdx + 1}~${endIdx}`);
    const batchPromises = Array(endIdx - startIdx).fill().map(async (_, i) => {
      const currentIndex = startIdx + i;
      try {
        const result = await extractInfo(currentIndex);
        completedRequestsRef.current += 1;
        setProgress(Math.round((completedRequestsRef.current / requestCount) * 100));
        return result;
      } catch (error) {
        toast({
          title: "警告",
          description: `リクエスト ${currentIndex + 1} が失敗しました: ${error.message}`,
          variant: "warning",
        });
        return null;
      }
    });

    const results = await Promise.all(batchPromises);
    addDebugLog(`バッチ完了: ${startIdx + 1}~${endIdx}`);
    return results.filter(result => result !== null);
  };

  const handleExtract = async () => {
    if (!apiKey || !customImage) {
      toast({
        title: "エラー",
        description: !apiKey ? "APIキーを入力してください。" : "画像をアップロードしてください。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractedInfoArray([]);
    setRawDataArray([]);
    setDebugLogs([]);
    completedRequestsRef.current = 0;
    setProgress(0);

    addDebugLog(`抽出開始: 全${requestCount}件`);

    try {
      const allResults = [];
      for (let i = 0; i < requestCount; i += MAX_CONCURRENT_REQUESTS) {
        const batchEnd = Math.min(i + MAX_CONCURRENT_REQUESTS, requestCount);
        addDebugLog(`バッチ開始: ${i + 1}~${batchEnd}件目`);
        const batchResults = await processBatch(i, batchEnd);
        allResults.push(...batchResults);
      }

      if (allResults.length === 0) {
        throw new Error('すべてのリクエストが失敗しました');
      }

      setExtractedInfoArray(allResults.map(r => r.cleanedData));
      setRawDataArray(allResults.map(r => r.rawData));

      addDebugLog(`処理完了: 成功${allResults.length}/${requestCount}件`);

      toast({
        title: "成功",
        description: `${allResults.length}/${requestCount}回の情報抽出が完了しました。`,
      });
    } catch (error) {
      addDebugLog(`エラー発生: ${error.message}`);
      toast({
        title: "エラー",
        description: `情報の抽出に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setCustomImage(null);
    setExtractedInfoArray([]);
    setRawDataArray([]);
    setProgress(0);
    setDebugLogs([]);
    completedRequestsRef.current = 0;
    setApiUsage({
      totalRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0
    });
    addDebugLog('リセット完了');
  };

  const calculateMatchRate = (key) => {
    if (extractedInfoArray.length === 0) return null;
    
    const values = extractedInfoArray.map(info => info[key] || '情報なし');
    const uniqueValues = new Set(values);
    const mainValue = values[0];
    const matchCount = values.filter(v => v === mainValue).length;
    
    return {
      rate: (matchCount / values.length) * 100,
      values: Array.from(uniqueValues),
    };
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">項目</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">一致率</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/6">抽出された値</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {keyItems.map(key => {
                        const match = calculateMatchRate(key);
                        if (!match) return null;
                        
                        return (
                          <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/6">
                              {key}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/6">
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
                            <td className="px-6 py-4 text-sm text-gray-500 w-3/6">
                              <div className="whitespace-pre-wrap">
                                {match.values.join(' | ')}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
