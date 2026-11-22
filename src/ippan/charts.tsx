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
  const [metric, setMetric] = useState("Capacity");
  const [period, setPeriod] = useState("6 months");
  const count = period === "6 months" ? 6 : 12;
  const values = Array.from({ length: count }, (_, i) => {
    const month = (12 - count + i) % 12;
    const until = String(month + 1).padStart(2, "0");
    return {
      name: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][month],
      Members: data.members.filter((m) => m.joined <= `2026-${until}-31`)
        .length,
      Capacity: data.projects
        .filter(
          (p, j) => j < Math.ceil(((i + 1) * data.projects.length) / count),
        )
        .reduce((n, p) => n + p.capacity, 0),
    };
  });
  return (
    <Panel
      title="A growing energy community"
      sub="Illustrative progression from current sample records"
      action={
        <select
          aria-label="Chart period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>6 months</option>
          <option>12 months</option>
        </select>
      }
    >
      <div className="chart-tabs">
        {["Capacity", "Members"].map((x) => (
          <button
            key={x}
            className={metric === x ? "selected" : ""}
            onClick={() => setMetric(x)}
          >
            <span
              style={{ background: x === "Capacity" ? colors[0] : colors[1] }}
            />
            {x}
            {x === "Capacity" ? " (MW)" : ""}
          </button>
        ))}
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={values}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={metric === "Capacity" ? colors[0] : colors[1]}
                  stopOpacity={0.22}
                />
                <stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#edf0f3"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8b96a6" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8b96a6" }}
            />
            <Tooltip contentStyle={tip} />
            <Area
              name={metric}
              dataKey={metric}
              type="monotone"
              stroke={metric === "Capacity" ? colors[0] : colors[1]}
              strokeWidth={2.5}
              fill="url(#fillGrowth)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-note">
        <span>↗</span> Sample project capacity represented by the member network
      </div>
    </Panel>
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
