import { Card, Badge, Input, Button } from "@/shared/components/ui";

export default function HomePage() {
    return (
    <table>
        <tbody>
        <tr>
            <td>Card</td>
            <td className="inline-flex items-center"><Card className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Card variant="glass" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Card variant="gradient" className="w-32 h-16"/></td>
        </tr>
        <tr>
            <td>Badge</td>
            <td className="inline-flex items-center"><Badge className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Badge variant="secondary" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Badge variant="success" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Badge variant="warning" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Badge variant="error" className="w-32 h-16"/></td>
        </tr>
        <tr>
            <td>Input</td>
            <td className="inline-flex items-center"><Input className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Input variant="glass" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Input variant="error" className="w-32 h-16"/></td>
        </tr>
        <tr >
            <td>Button</td>
            <td className="inline-flex items-center"><Button className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Button variant="glass" className="w-32 h-16"/></td>
            <td className="inline-flex items-center"><Button variant="ghost" className="w-32 h-16"/></td>
        </tr>
        </tbody>
    </table>)
}