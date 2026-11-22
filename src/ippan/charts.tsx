"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { usePlatform, Panel } from "./ui";
import { provinces } from "./model";
import { monthlyRecords } from "./analytics-data";
import { DataChart } from "./analytics";
const colors = [
  "#11a28c",
  "#5f70dc",
  "#49b5d0",
  "#f0ba5d",
  "#9c80d1",
  "#a9b8c9",
  "#ed8c7a",
];
const tip = {
  border: "1px solid #e5eaf0",
  borderRadius: 10,
  fontSize: 14,
  boxShadow: "0 8px 30px #0b203512",
};
export function GrowthChart() {
  const { data } = usePlatform();
  return (
    <DataChart
      title="Membership growth"
      rows={monthlyRecords(data.members, data.payments).map((r) => ({
        name: r.name,
        value: r.Total,
      }))}
      type="line"
      sub="Cumulative records by joining date · no invented project history"
    />
  );
}
export function MembershipChart() {
  const { data } = usePlatform();
  const active = data.members.filter((m) => m.status === "Active").length;
  const expired = data.members.length - active;
  const pending = data.applications.filter(
    (a) => a.status === "Pending",
  ).length;
  const values = [
    { name: "Active members", value: active },
    { name: "Expired members", value: expired },
    { name: "Applications", value: pending },
  ].filter((v) => v.value > 0);
  return (
    <Panel title="Membership overview" sub="Membership health at a glance">
      <div className="donut-layout">
        <div className="donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={values}
                innerRadius="66%"
                outerRadius="92%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {values.map((v, i) => (
                  <Cell key={v.name} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{data.members.length}</strong>
            <span>Total members</span>
          </div>
        </div>
        <div className="donut-legend">
          {values.map((v, i) => (
            <div key={v.name}>
              <span style={{ background: colors[i] }} />
              <label>{v.name}</label>
              <strong>{v.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-note">
        {Math.round((active / data.members.length) * 100)}% of memberships are
        currently active
      </div>
    </Panel>
  );
}
export function ProvinceChart() {
  const { data } = usePlatform();
  const values = provinces.map((name) => ({
    name: name === "Sudurpashchim" ? "Sudurpas." : name,
    capacity: data.projects
      .filter((p) => p.province === name)
      .reduce((n, p) => n + p.capacity, 0),
  }));
  return (
    <Panel
      title="Energy across the provinces"
      sub="Installed sample project capacity · MW"
    >
      <div className="province-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={values}
            margin={{ left: -20, right: 5, top: 15, bottom: 5 }}
          >
            <CartesianGrid vertical={false} stroke="#edf0f3" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8b96a6" }}
              interval={0}
              angle={-28}
              textAnchor="end"
              height={56}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8b96a6" }}
            />
            <Tooltip contentStyle={tip} />
            <Bar
              name="Capacity (MW)"
              dataKey="capacity"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            >
              {values.map((v, i) => (
                <Cell
                  key={v.name}
                  fill={i === 0 ? "#0c766b" : i === 2 ? "#6372df" : "#80c8bc"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
export function RevenueChart() {
  const { data } = usePlatform();
  const values = Array.from({ length: 6 }, (_, i) => ({
    name: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i],
    amount: data.payments
      .filter(
        (p) =>
          p.date.slice(5, 7) === String(i + 6).padStart(2, "0") &&
          p.status === "Simulated successful",
      )
      .reduce((n, p) => n + p.amount, 0),
  }));
  return (
    <Panel
      title="Membership collections"
      sub="Simulated successful payments · NPR"
    >
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={values}>
            <CartesianGrid vertical={false} stroke="#edf0f3" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => v / 1000 + "k"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip contentStyle={tip} />
            <Bar
              dataKey="amount"
              name="Simulated collections"
              fill="#0c9380"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
