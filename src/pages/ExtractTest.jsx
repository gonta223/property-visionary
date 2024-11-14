import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/use-toast";
import { useDropzone } from 'react-dropzone';
import PropertyListing from '../components/PropertyListing';

const ExtractTest = () => {
  const [apiKey, setApiKey] = useState('');
  const [extractedInfoArray, setExtractedInfoArray] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [rawDataArray, setRawDataArray] = useState([]);
  const [requestCount, setRequestCount] = useState(3); // デフォルトで3回
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target.result);
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
    }
  };

  const extractInfo = async () => {
    try {
      console.log('Sending request to API...');
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

      console.log('Response received:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const errorMessage = data.error?.message || `API request failed with status ${response.status}`;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from API');
      }

      let extractedData;
      try {
        extractedData = JSON.parse(data.choices[0].message.content);
        console.log('Parsed data:', extractedData);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Content that failed to parse:', data.choices[0].message.content);
        throw new Error('Failed to parse API response as JSON');
      }

      // プロパティ名から番号を削除し、nullやundefinedを「情報なし」に変換
      const cleanedData = {};
      for (const [key, value] of Object.entries(extractedData)) {
        const cleanKey = key.replace(/^\d+\./, '');
        cleanedData[cleanKey] = value || '情報なし';
      }

      return { cleanedData, rawData: data };
    } catch (error) {
      console.error('Extract info error:', error);
      throw error;
    }
  };

  const handleExtract = async () => {
    if (!apiKey) {
      toast({
        title: "エラー",
        description: "APIキーを入力してください。",
        variant: "destructive",
      });
      return;
    }

    if (!customImage) {
      toast({
        title: "エラー",
        description: "画像をアップロードしてください。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractedInfoArray([]);
    setRawDataArray([]);

    try {
      const results = [];
      for (let i = 0; i < requestCount; i++) {
        try {
          console.log(`Starting request ${i + 1}/${requestCount}`);
          const result = await extractInfo();
          results.push(result);
          
          setExtractedInfoArray(prev => [...prev, result.cleanedData]);
          setRawDataArray(prev => [...prev, result.rawData]);
          
          console.log(`Request ${i + 1} completed successfully`);
        } catch (error) {
          console.error(`Error in request ${i + 1}:`, error);
          toast({
            title: "警告",
            description: `リクエスト ${i + 1} が失敗しました: ${error.message}`,
            variant: "warning",
          });
        }
      }

      if (results.length === 0) {
        throw new Error('すべてのリクエストが失敗しました');
      }

      toast({
        title: "成功",
        description: `${results.length}/${requestCount}回の情報抽出が完了しました。`,
      });
    } catch (error) {
      console.error('Error:', error);
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
  };

  // 結果の一致率を計算
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

  // 重要な項目のリスト
  const keyItems = [
    '家賃', '管理費', '共益費', '敷金', '礼金', '住所', '最寄駅', '駅からの距離',
    '建物種別', '構造', '築年数', '専有面積', '間取り'
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-800">物件情報抽出テスト</CardTitle>
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
                  処理中... ({extractedInfoArray.length}/{requestCount})
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

          {extractedInfoArray.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-800">抽出結果の比較</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">一致率</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">抽出された値</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {keyItems.map(key => {
                        const match = calculateMatchRate(key);
                        if (!match) return null;
                        
                        return (
                          <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {key}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div
                                  className={`h-2.5 rounded-full mr-2 ${
                                    match.rate === 100 ? 'bg-green-500' :
                                    match.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${match.rate}%` }}
                                />
                                {match.rate.toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {match.values.join(' | ')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractedInfoArray.map((info, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">結果 #{index + 1}</h3>
                      <PropertyListing propertyInfo={info} />
                    </div>
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
