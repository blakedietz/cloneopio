defmodule AppWeb.BoardLive.Card do
  use Phoenix.Component

  attr :x, :integer, required: true
  attr :y, :integer, required: true

  def render(assigns) do
    ~H"""
    <div style={"top: #{@y}; left: #{@x};"} class="min-h-[34px] min-w-[34px]" />
    """
  end
end
