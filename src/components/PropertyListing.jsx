import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const PropertyListing = ({ propertyInfo }) => {
  if (!propertyInfo) return null;

  const mainInfo = [
    '家賃', '管理費', '共益費', '敷金', '礼金', '住所', '最寄駅', '駅からの距離', '建物種別', '構造',
    '階数', '築年数', 'リフォーム年', '向き', '専有面積', '間取り', 'バルコニー面積',
    '設備（キッチン）', '設備（バス・トイレ）', '設備（収納）', '設備（冷暖房）', '設備（セキュリティ）',
    '駐車場', 'バイク置き場', '自転車置き場', 'ペット可否', '契約期間', '現況', '引渡し時期',
    '取引形態', '備考'
  ];

  const formatFee = (fee, type) => {
    if (fee && fee !== '情報なし') {
      return `${type} ${fee}`;
    }
    return null;
  };

  const managementFee = formatFee(propertyInfo['管理費'], '管理費') || formatFee(propertyInfo['共益費'], '共益費') || '情報なし';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto mt-8">
      <div className="bg-gray-800 text-white p-4 mb-6 rounded-t-lg">
        <h2 className="text-2xl font-bold">賃貸{propertyInfo['建物種別'] || 'マンション'}</h2>
        <h3 className="text-xl">{propertyInfo['名称'] || '物件名'}</h3>
      </div>
      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-7">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl font-bold">
              家賃 {propertyInfo['家賃'] || '情報なし'}
              <span className="text-sm font-normal ml-2">
                （{managementFee}）
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <img src={propertyInfo['外観画像'] || '/placeholder.svg'} alt="建物外観" className="w-full h-48 object-cover rounded-lg" />
            <img src={propertyInfo['内装画像1'] || '/placeholder.svg'} alt="内装" className="w-full h-48 object-cover rounded-lg" />
          </div>
          <div className="mb-4">
            <p className="font-bold text-lg mb-1">住所</p>
            <p>{propertyInfo['住所'] || '情報なし'}</p>
          </div>
          <div className="mb-4">
            <p className="font-bold text-lg mb-1">アクセス</p>
            <p>{propertyInfo['最寄駅']} {propertyInfo['駅からの距離']}</p>
          </div>
        </div>
        
        {/* Right column */}
        <div className="col-span-5">
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableBody>
                  {mainInfo.map((key) => (
                    <TableRow key={key}>
                      <TableCell className="font-bold">{key}</TableCell>
                      <TableCell>{propertyInfo[key] || '情報なし'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <h4 className="font-bold mb-2">取扱不動産会社情報</h4>
        <p>会社名: {propertyInfo['取扱不動産会社'] || '情報なし'}</p>
        <p>TEL: {propertyInfo['電話番号'] || '情報なし'}</p>
        <p>住所: {propertyInfo['不動産会社住所'] || '情報なし'}</p>
        <p>免許番号: {propertyInfo['免許番号'] || '情報なし'}</p>
      </div>
    </div>
  );
};

export default PropertyListing;