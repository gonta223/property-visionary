import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const PropertyListing = ({ propertyInfo }) => {
  if (!propertyInfo) return null;

  const mainInfo = ['最寄駅', '間取り', '敷金/礼金', '建物種別', '構造', '階数', '築年数', '専有面積'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <div className="bg-black text-white p-2 mb-4">
        <h2 className="text-2xl font-bold">賃貸マンション</h2>
        <h3 className="text-xl">{propertyInfo['名称'] || 'X-OVER21 覚王山'}</h3>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {/* Left column */}
        <div className="col-span-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl font-bold">
              家賃 {propertyInfo['家賃'] || '59,000円'}
              <span className="text-sm font-normal ml-2">（共益費{propertyInfo['管理費'] || '5,200円'}）</span>
            </div>
            <div className="bg-yellow-300 p-2 text-sm font-bold">
              礼金0円キャンペーン！<br />
              転勤・新入生応援！
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <img src={propertyInfo['外観画像'] || '/placeholder.svg'} alt="建物外観" className="w-full h-40 object-cover" />
            <div className="grid grid-cols-2 gap-2">
              <img src={propertyInfo['内装画像1'] || '/placeholder.svg'} alt="内装1" className="w-full h-19 object-cover" />
              <img src={propertyInfo['内装画像2'] || '/placeholder.svg'} alt="内装2" className="w-full h-19 object-cover" />
              <img src={propertyInfo['内装画像3'] || '/placeholder.svg'} alt="内装3" className="w-full h-19 object-cover" />
              <img src={propertyInfo['内装画像4'] || '/placeholder.svg'} alt="内装4" className="w-full h-19 object-cover" />
            </div>
          </div>
          <div className="mb-4">
            <img src={propertyInfo['間取り図'] || '/placeholder.svg'} alt="間取り図" className="w-full h-48 object-contain" />
          </div>
          <div>
            <img src={propertyInfo['地図'] || '/placeholder.svg'} alt="地図" className="w-full h-48 object-contain" />
          </div>
        </div>
        
        {/* Right column */}
        <div className="col-span-4">
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
      <div className="mt-4 text-sm">
        <p>株式会社〇〇不動産</p>
        <p>TEL: 000-0000-0000 FAX: 000-0000-0000</p>
        <p>愛知県名古屋市中区〇〇-〇-〇</p>
        <p>国土交通大臣免許(0)第00000号</p>
      </div>
    </div>
  );
};

export default PropertyListing;