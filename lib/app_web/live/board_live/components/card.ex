defmodule AppWeb.BoardLive.Components.Card do
  use Phoenix.Component

  def render(assigns) do
    ~H"""
    <div
      id={@id}
      class="card min-h-[30px] min-w-[90px] max-w-[300px] absolute bg-gray-500 rounded-md select-none flex flex-row p-1 pr-2"
      style={"left: #{@card.x}px; top: #{@card.y}px;"}
      data-card-id={"#{@card.id}"}
      phx-hook="Card"
    >
      <div class="w-full">
        <%= @card.notes %>
      </div>
      <div
        phx-hook="CardConnector"
        id={"card-connector-#{@card.id}"}
        class="w-[20px] flex flex-col h-full p-1"
      >
        <button class="rounded-full border-white border-2 p-1 h-[20px] w-[20px]" />
      </div>
    </div>
    """
  end
end
